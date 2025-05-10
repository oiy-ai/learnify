FROM python:3.11-slim

WORKDIR /app

# Install ffmpeg
RUN apt-get update && \
    apt-get install -y ffmpeg && \
    rm -rf /var/lib/apt/lists/*

# Install markitdown from PyPI
RUN pip install markitdown-mcp flask-cors

# Copy entrypoint script
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

# Run the MCP module with CORS enabled
ENTRYPOINT ["/app/entrypoint.sh"]
