# Scripts Documentation

This directory contains utility scripts for the 42C Banking API project.

## OpenAPI Specification Scripts

### check-openapi.sh (Bash)

A bash wrapper script that checks for the existence of an OpenAPI specification and generates one if missing.

**Usage:**
```bash
./scripts/check-openapi.sh
```

**Features:**
- Checks if OpenAPI spec exists at `backend/openapi/openAPI.json`
- Validates the OpenAPI spec structure
- Generates a new OpenAPI spec from source code if missing or invalid
- Provides clear status messages and error reporting

**Requirements:**
- Node.js installed

---

### check-openapi.js (Node.js)

A Node.js script that evaluates the Express.js source code and generates an OpenAPI specification.

**Usage:**
```bash
node scripts/check-and-generate-openapi.js
```

**Features:**
- Scans Express.js route files
- Extracts endpoint information from routes
- Generates OpenAPI 3.0.3 compliant specification
- Validates existing OpenAPI specs
- Creates missing OpenAPI spec with proper structure

**Generated OpenAPI spec includes:**
- All authentication endpoints (`/auth/register`, `/auth/login`)
- Account management endpoints
- Payment and transfer endpoints
- Transaction history endpoints
- Product application endpoints (cards, mortgages)
- File upload/download endpoints

---

### check-openapi.py (Python)

A Python script that checks for OpenAPI specifications and generates one if needed.

**Usage:**
```bash
python3 scripts/check-openapi.py [OPTIONS]
```

**Options:**
- `--force-generate` - Force generation of OpenAPI spec even if one exists
- `-q, --quiet` - Quiet mode with minimal output
- `-h, --help` - Show help message

**Examples:**
```bash
# Check and generate if missing
python3 scripts/check-openapi.py

# Force regeneration
python3 scripts/check-openapi.py --force-generate

# Quiet mode (for CI/CD)
python3 scripts/check-openapi.py -q
```

**Features:**
- Pure Python implementation (no external dependencies)
- Compatible with CI/CD pipelines
- JSON validation of existing OpenAPI specs
- Generates comprehensive OpenAPI 3.0.3 specification

---

## Integration with CI/CD

### GitHub Actions

Add the following step to your GitHub Actions workflow:

```yaml
- name: Check and Generate OpenAPI Spec
  run: |
    python3 scripts/check-openapi.py
```

Or using the bash script:

```yaml
- name: Check and Generate OpenAPI Spec
  run: |
    chmod +x scripts/check-openapi.sh
    ./scripts/check-openapi.sh
```

### Azure Pipelines

Add this step to your `azure-pipelines.yml`:

```yaml
- script: |
    python3 scripts/check-openapi.py
  displayName: 'Check and Generate OpenAPI Spec'
```

### Pre-commit Hook

Add to `.git/hooks/pre-commit`:

```bash
#!/bin/bash
python3 scripts/check-openapi.py -q || exit 1
```

---

## Other Scripts

### conformance_scanv2.py

A Python script for managing 42Crunch Conformance Scan v2 configurations.

**Usage:**
```bash
python3 scripts/conformance_scanv2.py [OPTIONS]
```

See the script's `--help` for detailed usage information.

---

### bankAPIReset.sh

Resets the API server by stopping, removing, and restarting Docker containers.

**Usage:**
```bash
./scripts/bankAPIReset.sh
```

---

### bankAPIFWReset.sh

Similar to `bankAPIReset.sh` but for the firewalled configuration.

**Usage:**
```bash
./scripts/bankAPIFWReset.sh
```

---

### bankDataReset.sh

Resets the database container, clearing all data and starting fresh with seed data.

**Usage:**
```bash
./scripts/bankDataReset.sh
```

---

## Contributing

When adding new scripts:

1. Make them executable: `chmod +x script-name.sh`
2. Add a shebang line at the top
3. Document the script in this README
4. Include usage examples
5. Add error handling
6. Provide clear status messages

## License

See the project's main LICENSE file.
