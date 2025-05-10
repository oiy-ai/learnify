#!/bin/bash

# Enable CORS by setting environment variables
export FLASK_CORS_HEADERS="Content-Type,Authorization"
export FLASK_CORS_ORIGINS="*"

# Run the markitdown server with CORS enabled
python -m markitdown_mcp --sse --host 0.0.0.0 --port 3001 