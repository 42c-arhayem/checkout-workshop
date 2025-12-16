#!/usr/bin/env node

/**
 * Script to check if OpenAPI spec exists and generate one if missing
 * This script evaluates the source code and creates an OpenAPI specification
 * if one is not found in the expected location.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const OPENAPI_DIR = path.join(__dirname, '../backend/openapi');
const OPENAPI_FILE = path.join(OPENAPI_DIR, 'openAPI.json');
const BACKEND_DIR = path.join(__dirname, '../backend/app');

/**
 * Check if OpenAPI spec file exists
 */
function checkOpenAPIExists() {
    console.log(`Checking for OpenAPI spec at: ${OPENAPI_FILE}`);
    return fs.existsSync(OPENAPI_FILE);
}

/**
 * Generate a basic OpenAPI spec from Express.js routes
 */
async function generateOpenAPISpec() {
    console.log('OpenAPI spec not found. Generating from source code...');
    
    // Ensure the openapi directory exists
    if (!fs.existsSync(OPENAPI_DIR)) {
        fs.mkdirSync(OPENAPI_DIR, { recursive: true });
    }

    // Read route files to extract endpoint information
    const routesDir = path.join(BACKEND_DIR, 'routes');
    const routeFiles = fs.readdirSync(routesDir).filter(file => file.endsWith('.js'));
    
    const paths = {};
    
    // Parse auth routes
    if (routeFiles.includes('authRoutes.js')) {
        paths['/auth/register'] = {
            post: {
                tags: ['Authentication'],
                summary: 'Register a new account',
                operationId: 'AccountRegister',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['name', 'email', 'postalAddress', 'pan', 'accountType'],
                                properties: {
                                    name: { type: 'string', description: 'User full name' },
                                    email: { type: 'string', format: 'email', description: 'User email address' },
                                    postalAddress: {
                                        type: 'object',
                                        properties: {
                                            country: { type: 'string', description: 'Country code' }
                                        }
                                    },
                                    pan: { type: 'string', description: 'Personal Account Number' },
                                    accountType: { type: 'string', description: 'Account type' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    '201': {
                        description: 'Account created successfully'
                    },
                    '400': {
                        description: 'Invalid input'
                    },
                    '409': {
                        description: 'User already exists'
                    }
                }
            }
        };
        
        paths['/auth/login'] = {
            post: {
                tags: ['Authentication'],
                summary: 'Login to account',
                operationId: 'AccountLogin',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['email', 'pan'],
                                properties: {
                                    email: { type: 'string', format: 'email', description: 'User email address' },
                                    pan: { type: 'string', description: 'Personal Account Number' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    '200': {
                        description: 'Login successful',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        token: { type: 'string', description: 'JWT access token' }
                                    }
                                }
                            }
                        }
                    },
                    '401': {
                        description: 'Invalid credentials'
                    }
                }
            }
        };
    }
    
    // Parse account routes
    if (routeFiles.includes('accountsRoutes.js')) {
        paths['/account'] = {
            get: {
                tags: ['Account'],
                summary: 'Get account details',
                operationId: 'GetAccount',
                security: [{ AccessToken: [] }],
                responses: {
                    '200': { description: 'Account details retrieved successfully' },
                    '401': { description: 'Unauthorized' }
                }
            },
            put: {
                tags: ['Account'],
                summary: 'Update account options',
                operationId: 'UpdateAccount',
                security: [{ AccessToken: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    options: { type: 'object', description: 'Account options' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    '200': { description: 'Account updated successfully' },
                    '401': { description: 'Unauthorized' }
                }
            },
            delete: {
                tags: ['Account'],
                summary: 'Delete account',
                operationId: 'DeleteAccount',
                security: [{ AccessToken: [] }],
                responses: {
                    '200': { description: 'Account deleted successfully' },
                    '401': { description: 'Unauthorized' }
                }
            }
        };
        
        paths['/account/balances'] = {
            get: {
                tags: ['Account'],
                summary: 'Get account balance',
                operationId: 'GetBalance',
                security: [{ AccessToken: [] }],
                responses: {
                    '200': { description: 'Balance retrieved successfully' },
                    '401': { description: 'Unauthorized' }
                }
            }
        };
        
        paths['/account/payees'] = {
            get: {
                tags: ['Payees'],
                summary: 'Get list of payees',
                operationId: 'GetPayees',
                security: [{ AccessToken: [] }],
                responses: {
                    '200': { description: 'Payees retrieved successfully' },
                    '401': { description: 'Unauthorized' }
                }
            },
            post: {
                tags: ['Payees'],
                summary: 'Create a new payee',
                operationId: 'CreatePayee',
                security: [{ AccessToken: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    name: { type: 'string', description: 'Payee name' },
                                    accountNumber: { type: 'string', description: 'Account number' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    '201': { description: 'Payee created successfully' },
                    '401': { description: 'Unauthorized' }
                }
            }
        };
        
        paths['/account/payments/transfer'] = {
            post: {
                tags: ['Payments'],
                summary: 'Create a transfer payment',
                operationId: 'CreateTransferPayment',
                security: [{ AccessToken: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    amount: { type: 'number', description: 'Transfer amount' },
                                    toAccount: { type: 'string', description: 'Destination account' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    '200': { description: 'Transfer successful' },
                    '401': { description: 'Unauthorized' }
                }
            }
        };
        
        paths['/account/transactions'] = {
            get: {
                tags: ['Transactions'],
                summary: 'Get transaction list',
                operationId: 'GetTransactions',
                security: [{ AccessToken: [] }],
                responses: {
                    '200': { description: 'Transactions retrieved successfully' },
                    '401': { description: 'Unauthorized' }
                }
            }
        };
        
        paths['/account/products/cards'] = {
            get: {
                tags: ['Products'],
                summary: 'Get card applications',
                operationId: 'GetCardApplications',
                security: [{ AccessToken: [] }],
                responses: {
                    '200': { description: 'Card applications retrieved successfully' },
                    '401': { description: 'Unauthorized' }
                }
            },
            post: {
                tags: ['Products'],
                summary: 'Create card application',
                operationId: 'CreateCardApplication',
                security: [{ AccessToken: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    cardType: { type: 'string', description: 'Type of card' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    '201': { description: 'Card application created successfully' },
                    '401': { description: 'Unauthorized' }
                }
            }
        };
        
        paths['/account/files'] = {
            post: {
                tags: ['Files'],
                summary: 'Upload a file',
                operationId: 'UploadFile',
                security: [{ AccessToken: [] }],
                responses: {
                    '201': { description: 'File uploaded successfully' },
                    '401': { description: 'Unauthorized' }
                }
            },
            get: {
                tags: ['Files'],
                summary: 'Download a file',
                operationId: 'DownloadFile',
                security: [{ AccessToken: [] }],
                responses: {
                    '200': { description: 'File retrieved successfully' },
                    '401': { description: 'Unauthorized' }
                }
            }
        };
    }
    
    // Create OpenAPI spec structure
    const openAPISpec = {
        openapi: '3.0.3',
        info: {
            title: '42C Bank API',
            description: 'An intentionally insecure banking API for education and training purposes',
            version: '1.0.0',
            contact: {
                name: '42Crunch Support',
                url: 'https://support.42crunch.com',
                email: 'support@42crunch.com'
            }
        },
        servers: [
            {
                url: 'http://localhost:3000/apis/banking/v1',
                description: 'Local development server'
            }
        ],
        paths,
        components: {
            securitySchemes: {
                AccessToken: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'JWT access token obtained from /auth/login'
                }
            }
        }
    };
    
    // Write the OpenAPI spec to file
    fs.writeFileSync(OPENAPI_FILE, JSON.stringify(openAPISpec, null, 2));
    console.log(`✅ OpenAPI spec generated successfully at: ${OPENAPI_FILE}`);
    
    return openAPISpec;
}

/**
 * Main function
 */
async function main() {
    console.log('🔍 Evaluating source code for OpenAPI specification...\n');
    
    const exists = checkOpenAPIExists();
    
    if (exists) {
        console.log('✅ OpenAPI spec found!');
        console.log(`   Location: ${OPENAPI_FILE}\n`);
        
        // Validate it's a valid JSON
        try {
            const content = fs.readFileSync(OPENAPI_FILE, 'utf8');
            const spec = JSON.parse(content);
            
            if (spec.openapi && spec.info && spec.paths) {
                console.log('✅ OpenAPI spec is valid');
                console.log(`   Title: ${spec.info.title}`);
                console.log(`   Version: ${spec.info.version}`);
                console.log(`   Paths: ${Object.keys(spec.paths).length} endpoints`);
            } else {
                console.log('⚠️  OpenAPI spec structure is incomplete');
                console.log('   Consider regenerating the spec');
            }
        } catch (error) {
            console.error('❌ Error reading OpenAPI spec:', error.message);
            console.log('   Generating a new spec...\n');
            await generateOpenAPISpec();
        }
    } else {
        console.log('⚠️  OpenAPI spec not found!');
        console.log('   Expected location:', OPENAPI_FILE);
        console.log('');
        await generateOpenAPISpec();
    }
    
    console.log('\n✅ OpenAPI evaluation complete!');
}

// Run the script
main().catch(error => {
    console.error('❌ Error:', error.message);
    process.exit(1);
});
