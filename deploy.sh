#!/bin/bash
set -euo pipefail

# Build the site with the specified environment
echo "Building site with Gozzi..."
gozzi build --config config/config.prod.toml

# Generate search index
echo "Generating search index..."
python3 generate-search-index.py

# Generate build timestamp
echo "Generating build timestamp..."
BUILD_TIME=$(date -u +"%Y-%m-%d %H:%M UTC")
cat > public/build-time.js << EOF
// Build timestamp - auto-generated during deployment
window.BUILD_TIME = "${BUILD_TIME}";
EOF

echo "Build completed! Output in public/ directory"
echo "Build time: ${BUILD_TIME}"
