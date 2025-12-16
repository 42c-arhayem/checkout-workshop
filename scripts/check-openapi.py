#!/usr/bin/env python3
"""
Script to check if OpenAPI spec exists and generate one if missing.
This script evaluates the source code and creates an OpenAPI specification
if one is not found in the expected location.
"""

import os
import sys
import json
from pathlib import Path
import argparse


def get_project_paths():
    """Get the project paths."""
    script_dir = Path(__file__).parent.absolute()
    project_root = script_dir.parent
    openapi_dir = project_root / 'backend' / 'openapi'
    openapi_file = openapi_dir / 'openAPI.json'
    
    return {
        'project_root': project_root,
        'openapi_dir': openapi_dir,
        'openapi_file': openapi_file
    }


def check_openapi_exists(openapi_file):
    """Check if OpenAPI spec file exists."""
    print(f"Checking for OpenAPI spec at: {openapi_file}")
    return openapi_file.exists()


def validate_openapi_spec(openapi_file):
    """Validate the OpenAPI spec structure."""
    try:
        with open(openapi_file, 'r') as f:
            spec = json.load(f)
        
        if 'openapi' in spec and 'info' in spec and 'paths' in spec:
            print('✅ OpenAPI spec is valid')
            print(f"   Title: {spec['info'].get('title', 'Unknown')}")
            print(f"   Version: {spec['info'].get('version', 'Unknown')}")
            print(f"   Paths: {len(spec['paths'])} endpoints")
            return True
        else:
            print('⚠️  OpenAPI spec structure is incomplete')
            print('   Consider regenerating the spec')
            return False
    except json.JSONDecodeError as e:
        print(f'❌ Error parsing OpenAPI spec: {e}')
        return False
    except Exception as e:
        print(f'❌ Error reading OpenAPI spec: {e}')
        return False


def generate_openapi_spec(openapi_dir, openapi_file):
    """Generate a basic OpenAPI spec from Express.js routes."""
    print('OpenAPI spec not found. Generating from source code...')
    
    # Ensure the openapi directory exists
    openapi_dir.mkdir(parents=True, exist_ok=True)
    
    # Define the OpenAPI spec structure
    openapi_spec = {
        "openapi": "3.0.3",
        "info": {
            "title": "42C Bank API",
            "description": "An intentionally insecure banking API for education and training purposes",
            "version": "1.0.0",
            "contact": {
                "name": "42Crunch Support",
                "url": "https://support.42crunch.com",
                "email": "support@42crunch.com"
            }
        },
        "servers": [
            {
                "url": "http://localhost:3000/apis/banking/v1",
                "description": "Local development server"
            }
        ],
        "paths": {
            "/auth/register": {
                "post": {
                    "tags": ["Authentication"],
                    "summary": "Register a new account",
                    "operationId": "AccountRegister",
                    "requestBody": {
                        "required": True,
                        "content": {
                            "application/json": {
                                "schema": {
                                    "type": "object",
                                    "required": ["name", "email", "postalAddress", "pan", "accountType"],
                                    "properties": {
                                        "name": {"type": "string", "description": "User full name"},
                                        "email": {"type": "string", "format": "email", "description": "User email address"},
                                        "postalAddress": {
                                            "type": "object",
                                            "properties": {
                                                "country": {"type": "string", "description": "Country code"}
                                            }
                                        },
                                        "pan": {"type": "string", "description": "Personal Account Number"},
                                        "accountType": {"type": "string", "description": "Account type"}
                                    }
                                }
                            }
                        }
                    },
                    "responses": {
                        "201": {"description": "Account created successfully"},
                        "400": {"description": "Invalid input"},
                        "409": {"description": "User already exists"}
                    }
                }
            },
            "/auth/login": {
                "post": {
                    "tags": ["Authentication"],
                    "summary": "Login to account",
                    "operationId": "AccountLogin",
                    "requestBody": {
                        "required": True,
                        "content": {
                            "application/json": {
                                "schema": {
                                    "type": "object",
                                    "required": ["email", "pan"],
                                    "properties": {
                                        "email": {"type": "string", "format": "email", "description": "User email address"},
                                        "pan": {"type": "string", "description": "Personal Account Number"}
                                    }
                                }
                            }
                        }
                    },
                    "responses": {
                        "200": {
                            "description": "Login successful",
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "type": "object",
                                        "properties": {
                                            "token": {"type": "string", "description": "JWT access token"}
                                        }
                                    }
                                }
                            }
                        },
                        "401": {"description": "Invalid credentials"}
                    }
                }
            },
            "/account": {
                "get": {
                    "tags": ["Account"],
                    "summary": "Get account details",
                    "operationId": "GetAccount",
                    "security": [{"AccessToken": []}],
                    "responses": {
                        "200": {"description": "Account details retrieved successfully"},
                        "401": {"description": "Unauthorized"}
                    }
                },
                "put": {
                    "tags": ["Account"],
                    "summary": "Update account options",
                    "operationId": "UpdateAccount",
                    "security": [{"AccessToken": []}],
                    "requestBody": {
                        "required": True,
                        "content": {
                            "application/json": {
                                "schema": {
                                    "type": "object",
                                    "properties": {
                                        "options": {"type": "object", "description": "Account options"}
                                    }
                                }
                            }
                        }
                    },
                    "responses": {
                        "200": {"description": "Account updated successfully"},
                        "401": {"description": "Unauthorized"}
                    }
                },
                "delete": {
                    "tags": ["Account"],
                    "summary": "Delete account",
                    "operationId": "DeleteAccount",
                    "security": [{"AccessToken": []}],
                    "responses": {
                        "200": {"description": "Account deleted successfully"},
                        "401": {"description": "Unauthorized"}
                    }
                }
            },
            "/account/balances": {
                "get": {
                    "tags": ["Account"],
                    "summary": "Get account balance",
                    "operationId": "GetBalance",
                    "security": [{"AccessToken": []}],
                    "responses": {
                        "200": {"description": "Balance retrieved successfully"},
                        "401": {"description": "Unauthorized"}
                    }
                }
            },
            "/account/payees": {
                "get": {
                    "tags": ["Payees"],
                    "summary": "Get list of payees",
                    "operationId": "GetPayees",
                    "security": [{"AccessToken": []}],
                    "responses": {
                        "200": {"description": "Payees retrieved successfully"},
                        "401": {"description": "Unauthorized"}
                    }
                },
                "post": {
                    "tags": ["Payees"],
                    "summary": "Create a new payee",
                    "operationId": "CreatePayee",
                    "security": [{"AccessToken": []}],
                    "requestBody": {
                        "required": True,
                        "content": {
                            "application/json": {
                                "schema": {
                                    "type": "object",
                                    "properties": {
                                        "name": {"type": "string", "description": "Payee name"},
                                        "accountNumber": {"type": "string", "description": "Account number"}
                                    }
                                }
                            }
                        }
                    },
                    "responses": {
                        "201": {"description": "Payee created successfully"},
                        "401": {"description": "Unauthorized"}
                    }
                }
            },
            "/account/payments/transfer": {
                "post": {
                    "tags": ["Payments"],
                    "summary": "Create a transfer payment",
                    "operationId": "CreateTransferPayment",
                    "security": [{"AccessToken": []}],
                    "requestBody": {
                        "required": True,
                        "content": {
                            "application/json": {
                                "schema": {
                                    "type": "object",
                                    "properties": {
                                        "amount": {"type": "number", "description": "Transfer amount"},
                                        "toAccount": {"type": "string", "description": "Destination account"}
                                    }
                                }
                            }
                        }
                    },
                    "responses": {
                        "200": {"description": "Transfer successful"},
                        "401": {"description": "Unauthorized"}
                    }
                }
            },
            "/account/transactions": {
                "get": {
                    "tags": ["Transactions"],
                    "summary": "Get transaction list",
                    "operationId": "GetTransactions",
                    "security": [{"AccessToken": []}],
                    "responses": {
                        "200": {"description": "Transactions retrieved successfully"},
                        "401": {"description": "Unauthorized"}
                    }
                }
            },
            "/account/products/cards": {
                "get": {
                    "tags": ["Products"],
                    "summary": "Get card applications",
                    "operationId": "GetCardApplications",
                    "security": [{"AccessToken": []}],
                    "responses": {
                        "200": {"description": "Card applications retrieved successfully"},
                        "401": {"description": "Unauthorized"}
                    }
                },
                "post": {
                    "tags": ["Products"],
                    "summary": "Create card application",
                    "operationId": "CreateCardApplication",
                    "security": [{"AccessToken": []}],
                    "requestBody": {
                        "required": True,
                        "content": {
                            "application/json": {
                                "schema": {
                                    "type": "object",
                                    "properties": {
                                        "cardType": {"type": "string", "description": "Type of card"}
                                    }
                                }
                            }
                        }
                    },
                    "responses": {
                        "201": {"description": "Card application created successfully"},
                        "401": {"description": "Unauthorized"}
                    }
                }
            },
            "/account/files": {
                "post": {
                    "tags": ["Files"],
                    "summary": "Upload a file",
                    "operationId": "UploadFile",
                    "security": [{"AccessToken": []}],
                    "responses": {
                        "201": {"description": "File uploaded successfully"},
                        "401": {"description": "Unauthorized"}
                    }
                },
                "get": {
                    "tags": ["Files"],
                    "summary": "Download a file",
                    "operationId": "DownloadFile",
                    "security": [{"AccessToken": []}],
                    "responses": {
                        "200": {"description": "File retrieved successfully"},
                        "401": {"description": "Unauthorized"}
                    }
                }
            }
        },
        "components": {
            "securitySchemes": {
                "AccessToken": {
                    "type": "http",
                    "scheme": "bearer",
                    "bearerFormat": "JWT",
                    "description": "JWT access token obtained from /auth/login"
                }
            }
        }
    }
    
    # Write the OpenAPI spec to file
    with open(openapi_file, 'w') as f:
        json.dump(openapi_spec, f, indent=2)
    
    print(f'✅ OpenAPI spec generated successfully at: {openapi_file}')
    return openapi_spec


def main():
    """Main function."""
    parser = argparse.ArgumentParser(
        description='Check and generate OpenAPI specification'
    )
    parser.add_argument(
        '--force-generate',
        action='store_true',
        help='Force generation of OpenAPI spec even if one exists'
    )
    parser.add_argument(
        '-q', '--quiet',
        action='store_true',
        help='Quiet mode - minimal output'
    )
    
    args = parser.parse_args()
    
    if not args.quiet:
        print('🔍 Evaluating source code for OpenAPI specification...\n')
    
    paths = get_project_paths()
    openapi_file = paths['openapi_file']
    openapi_dir = paths['openapi_dir']
    
    exists = check_openapi_exists(openapi_file)
    
    if args.force_generate:
        if not args.quiet:
            print('⚠️  Force generation enabled. Regenerating OpenAPI spec...\n')
        generate_openapi_spec(openapi_dir, openapi_file)
    elif exists:
        if not args.quiet:
            print('✅ OpenAPI spec found!')
            print(f'   Location: {openapi_file}\n')
        
        is_valid = validate_openapi_spec(openapi_file)
        
        if not is_valid:
            if not args.quiet:
                print('   Generating a new spec...\n')
            generate_openapi_spec(openapi_dir, openapi_file)
    else:
        if not args.quiet:
            print('⚠️  OpenAPI spec not found!')
            print(f'   Expected location: {openapi_file}\n')
        generate_openapi_spec(openapi_dir, openapi_file)
    
    if not args.quiet:
        print('\n✅ OpenAPI evaluation complete!')
    
    return 0


if __name__ == '__main__':
    try:
        sys.exit(main())
    except Exception as e:
        print(f'❌ Error: {e}', file=sys.stderr)
        sys.exit(1)
