#!/bin/bash

BASE_CONFIG="config/base.toml"
OUTPUT_CONFIG="config.toml"

# Determine environment
if [ "$1" == "production" ]; then
    ENV_CONFIG="config/config.production.toml"
    echo "Using production config"
else
    ENV_CONFIG="config/config.dev.toml"
    echo "Using development config"
fi

# Merge configurations
cat "$BASE_CONFIG" > "$OUTPUT_CONFIG"
echo "" >> "$OUTPUT_CONFIG"
cat "$ENV_CONFIG" >> "$OUTPUT_CONFIG"

# Build the site
zola build