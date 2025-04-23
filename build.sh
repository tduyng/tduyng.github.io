#!/bin/bash

BASE_CONFIG="config/base.toml"
OUTPUT_CONFIG="config.toml"

# Determine environment
if [ "$1" == "prod" ]; then
  ENV_CONFIG="config/config.prod.toml"
  echo "Using production config"
else
  ENV_CONFIG="config/config.dev.toml"
  echo "Using development config"
fi

# Merge configurations
cat "$ENV_CONFIG" >"$OUTPUT_CONFIG" # Append environment config to output config

# Build the site
gozzi build
