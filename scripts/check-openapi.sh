#!/bin/bash

# Script to check and generate OpenAPI specification
# This script evaluates the source code and generates an OpenAPI spec if missing

set -e  # Exit on error

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "========================================"
echo "OpenAPI Specification Check & Generator"
echo "========================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed"
    echo "   Please install Node.js to use this script"
    exit 1
fi

# Run the OpenAPI check and generation script
cd "$PROJECT_ROOT"
node "$SCRIPT_DIR/check-and-generate-openapi.js"

exit_code=$?

if [ $exit_code -eq 0 ]; then
    echo ""
    echo "========================================"
    echo "✅ Script completed successfully"
    echo "========================================"
else
    echo ""
    echo "========================================"
    echo "❌ Script failed with exit code: $exit_code"
    echo "========================================"
fi

exit $exit_code
