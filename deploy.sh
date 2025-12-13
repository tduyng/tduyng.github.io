#!/bin/bash
set -euo pipefail

# Build the site
echo "Building site with Gozzi..."
gozzi build

# Generate search index
echo "Generating search index..."
python3 generate-search-index.py

echo "Build completed! Output in public/ directory"
