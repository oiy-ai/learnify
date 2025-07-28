#!/bin/bash

# Script to enable brand replacement during build
# This replaces "AFFiNE" with "Learnify" in the build output

export ENABLE_BRAND_REPLACE=true
export BRAND_NAME=Learnify

echo "🔄 Brand replacement enabled: AFFiNE → Learnify"

# Pass all arguments to the original command
exec "$@"