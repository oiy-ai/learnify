# Migration

```bash
docker compose up -d
```

# Google Cloud Run

> better run migration on local host first, then deploy to cloud run

## Image

ghcr.io/a1exsun/learnify-graphql:canary

## Container

have to set up the following environment variables:

- REDIS_SERVER_HOST
- REDIS_SERVER_PORT=6379
- REDIS_SERVER_USERNAME=default
- REDIS_SERVER_PASSWORD
- REDIS_SERVER_TLS=true 
- REDIS_SERVER_DATABASE=0
- DATABASE_URL=postgresql://username:password@database-ip:5432/database-name
- AFFINE_INDEXER_ENABLED=false

2 volumes:

- ${UPLOAD_LOCATION}:/root/.affine/storage
- ${CONFIG_LOCATION}:/root/.affine/config