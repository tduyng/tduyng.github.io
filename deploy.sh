#!/bin/bash
set -euo pipefail

# Build the site with the specified environment
echo "Building site with Gozzi..."
gozzi build --config config/config.prod.toml

# Generate search index
echo "Generating search index..."
python3 generate-search-index.py

echo "Build completed! Output in public/ directory"
