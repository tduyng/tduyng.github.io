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
cat "$BASE_CONFIG" > "$OUTPUT_CONFIG" # Copy base config to output config
echo "" >> "$OUTPUT_CONFIG"           # Add a newline to output config
cat "$ENV_CONFIG" >> "$OUTPUT_CONFIG" # Append environment config to output config

# Build the site
zola build