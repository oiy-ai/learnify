# Learnify Self-Host Docker Configuration

This directory contains Docker Compose configurations for self-hosting Learnify.

## 📁 Files Overview

- **`docker-compose.yml`** - Main production service configuration
- **`docker-compose-mig.yml`** - Database migration job configuration
- **`.env`** - Environment variables (contains sensitive data, **NOT** in version control)
- **`.env.example`** - Template for environment variables

## 🔒 Security Notice

**IMPORTANT**: All sensitive information (passwords, API keys, database credentials) is stored in the `.env` file, which is **excluded from version control** via `.gitignore`.

### Sensitive Data Includes:
- Database credentials (Supabase)
- Email/SMTP credentials (Larksuite)
- Server paths
- API keys and passwords

## 🚀 Quick Start

### 1. Setup Environment Variables

Copy the example environment file and fill in your actual values:

```bash
cp .env.example .env
```

Then edit `.env` with your actual credentials:

```bash
nano .env  # or use your preferred editor
```

### 2. Run Database Migration (First Time Only)

Before starting the main service, run the migration job:

```bash
docker compose -f docker-compose-mig.yml up
```

Wait for the migration to complete, then stop the containers:

```bash
docker compose -f docker-compose-mig.yml down
```

### 3. Start the Main Service

```bash
docker compose up -d
```

### 4. Check Service Status

```bash
docker compose ps
docker compose logs -f learnify
```

## 🔧 Configuration Details

### Environment Variables

All configuration is managed through the `.env` file. Key variables include:

| Variable | Description | Example |
|----------|-------------|---------|
| `AFFINE_REVISION` | Application version | `canary`, `stable`, `beta` |
| `PORT` | Internal service port | `3010` |
| `VOLUME_BASE_PATH` | Base path for volumes | `/path/to/volumes` |
| `DB_URL` | Database host | `your-db.supabase.co` |
| `DB_PASSWORD` | Database password | `your-secure-password` |
| `MAILER_HOST` | SMTP server | `smtp.example.com` |
| `MAILER_PASSWORD` | Email password | `your-email-password` |

### IPv6 Configuration

This setup is configured to use IPv6 for Supabase connections, as Supabase only supports IPv6:

- `NODE_OPTIONS=--dns-result-order=ipv6first`
- `enable_ipv6: true` in network configuration
- `net.ipv6.conf.all.disable_ipv6=0` sysctls

## 📝 Maintenance

### Update Application

```bash
# Pull latest image
docker compose pull

# Restart services
docker compose up -d
```

### View Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f learnify
```

### Backup Data

Important directories to backup:
- `${UPLOAD_LOCATION}` - User uploaded files
- `${CONFIG_LOCATION}` - Application configuration

## ⚠️ Important Notes

1. **Never commit `.env` file** - It contains sensitive credentials
2. **Always use `.env.example`** as a template for new deployments
3. **Run migrations** before starting the main service for the first time
4. **Ensure IPv6 is enabled** on your host system for Supabase connectivity
5. **Backup your data** regularly

## 🆘 Troubleshooting

### Service won't start
- Check `.env` file exists and has correct values
- Verify all required environment variables are set
- Check Docker logs: `docker compose logs`

### Database connection issues
- Verify database credentials in `.env`
- Ensure IPv6 is enabled on your system
- Check Supabase connection string format

### Migration fails
- Ensure Redis is healthy before migration runs
- Check migration logs: `docker compose -f docker-compose-mig.yml logs`

## 📚 Additional Resources

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Supabase Documentation](https://supabase.com/docs)
- [Learnify Documentation](https://github.com/oiy-ai/learnify)
