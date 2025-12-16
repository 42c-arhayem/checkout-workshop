# OpenAPI Specification Automation

This document describes the automated OpenAPI specification checking and generation feature added to the 42C Banking API project.

## Overview

The project now includes automated scripts that evaluate the source code and generate OpenAPI specifications if they are missing. This ensures that the API always has an up-to-date OpenAPI spec for security auditing, conformance scanning, and documentation purposes.

## How It Works

The automation works in three steps:

1. **Check**: The script looks for an OpenAPI specification at `backend/openapi/openAPI.json`
2. **Validate**: If found, it validates the structure to ensure it's a valid OpenAPI 3.0.3 spec
3. **Generate**: If missing or invalid, it analyzes the Express.js source code and generates a new spec

## Available Scripts

### Python Script (Recommended for CI/CD)

```bash
# Basic check
python3 scripts/check-openapi.py

# Quiet mode (for automation)
python3 scripts/check-openapi.py -q

# Force regeneration
python3 scripts/check-openapi.py --force-generate
```

**Features:**
- No external dependencies (pure Python)
- CLI options for automation
- Exit codes for CI/CD integration
- Verbose and quiet modes

### Node.js Script

```bash
node scripts/check-and-generate-openapi.js
```

**Features:**
- Directly reads Express.js route files
- Generates comprehensive endpoint definitions
- Validates JSON structure

### Bash Wrapper

```bash
./scripts/check-openapi.sh
```

**Features:**
- Simple command-line interface
- Clear status messages
- Easy to integrate into shell scripts

## Integration Examples

### GitHub Actions

The script is already integrated into the `.github/workflows/42c-bank.yml` workflow:

```yaml
- name: Check and Generate OpenAPI Specification
  run: |
    python3 ${{ github.workspace }}/scripts/check-openapi.py
```

### Azure Pipelines

Add to your `azure-pipelines.yml`:

```yaml
- script: python3 scripts/check-openapi.py
  displayName: 'Check OpenAPI Spec'
```

### Makefile

```bash
make check-openapi    # Check and generate if needed
make validate         # Validate spec
```

### Pre-commit Hook

Install the provided sample:

```bash
cp .pre-commit-hook.sample .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

## Generated OpenAPI Specification

The generated spec includes:

- **Authentication Endpoints**
  - POST /auth/register
  - POST /auth/login

- **Account Management**
  - GET /account
  - PUT /account
  - DELETE /account
  - GET /account/balances

- **Payees**
  - GET /account/payees
  - POST /account/payees

- **Payments**
  - POST /account/payments/transfer

- **Transactions**
  - GET /account/transactions

- **Products**
  - GET /account/products/cards
  - POST /account/products/cards

- **Files**
  - POST /account/files
  - GET /account/files

All endpoints include:
- Proper HTTP methods
- Request/response schemas
- Security requirements
- Tags for organization
- Operation IDs

## Security

The generated OpenAPI spec includes:
- JWT Bearer token authentication scheme
- Security requirements on protected endpoints
- Input validation schemas
- Response codes

## Customization

To modify the generated spec:

1. Run the script with `--force-generate` to create a new spec
2. Edit the generated `backend/openapi/openAPI.json` file
3. The script will preserve your changes on subsequent runs

Or modify the generation logic in:
- `scripts/check-openapi.py` (lines 80-370)
- `scripts/check-and-generate-openapi.js` (lines 41-390)

## Troubleshooting

**Issue**: Script fails with "Node.js not found"
- **Solution**: Install Node.js or use the Python script instead

**Issue**: Generated spec is incomplete
- **Solution**: The script extracts information from route files. Ensure routes are properly defined in `backend/app/routes/`

**Issue**: Validation fails on existing spec
- **Solution**: Run with `--force-generate` to regenerate, or manually fix the JSON structure

## Benefits

1. **Automation**: Never forget to create or update OpenAPI specs
2. **Consistency**: Generated specs follow OpenAPI 3.0.3 standard
3. **CI/CD Integration**: Works seamlessly in automated pipelines
4. **Documentation**: Always have up-to-date API documentation
5. **Security**: Enables automated security scanning with 42Crunch

## Future Enhancements

Potential improvements:
- Parse JSDoc comments for richer descriptions
- Extract request/response schemas from Mongoose models
- Support for multiple API versions
- Automatic schema validation against actual responses

## Support

For issues or questions:
- Check `scripts/README.md` for detailed documentation
- Review the inline comments in the script files
- Contact the development team

## License

See the project's main LICENSE file.
