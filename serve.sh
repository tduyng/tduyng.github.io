#!/bin/bash

set -euo pipefail

echo "🔨 Building site..."
gozzi build 

echo "🔍 Generating search index..."
python3 generate-search-index.py

gozzi serve
