# Database Migration Guide: SQLite to PostgreSQL

This guide will help you migrate from SQLite to PostgreSQL for production deployment.

## Why PostgreSQL for Production?

- **Concurrency**: PostgreSQL handles multiple users better than SQLite
- **Scalability**: Can handle larger datasets and more complex queries
- **Reliability**: Better data integrity and crash recovery
- **Railway Compatibility**: Railway provides managed PostgreSQL services
- **Performance**: Better performance for web applications

## Step 1: Export Current Data

First, let's export your current SQLite data:

```bash
python migrate_to_postgresql.py
```

This will:
- Export all your data to `data_migration/sqlite_data.json`
- Create a migration script for later use

## Step 2: Set Up PostgreSQL Locally (Optional)

For testing the migration locally:

### Option A: Using Docker (Recommended)

```bash
# Start PostgreSQL container
docker run --name ehcl-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=ehcl_dev -p 5432:5432 -d postgres:15

# Set environment variables
export DB_NAME=ehcl_dev
export DB_USER=postgres
export DB_PASSWORD=postgres
export DB_HOST=localhost
export DB_PORT=5432
```

### Option B: Install PostgreSQL Locally

1. **Windows**: Download from [postgresql.org](https://www.postgresql.org/download/windows/)
2. **macOS**: `brew install postgresql`
3. **Linux**: `sudo apt-get install postgresql postgresql-contrib`

## Step 3: Test Migration Locally

1. **Set environment variables**:
```bash
export DB_NAME=ehcl_dev
export DB_USER=postgres
export DB_PASSWORD=postgres
export DB_HOST=localhost
export DB_PORT=5432
```

2. **Run migrations**:
```bash
python manage.py migrate
```

3. **Load data**:
```bash
python manage.py loaddata data_migration/sqlite_data.json
```

4. **Test the application**:
```bash
python manage.py runserver
```

## Step 4: Deploy to Railway

### 1. Add PostgreSQL Service

1. Go to your Railway project dashboard
2. Click "New" → "Database" → "PostgreSQL"
3. Railway will automatically provide these environment variables:
   - `PGDATABASE`
   - `PGUSER`
   - `PGPASSWORD`
   - `PGHOST`
   - `PGPORT`

### 2. Set Environment Variables

Add these to your Railway service:

```bash
DJANGO_ENV=railway
SECRET_KEY=your-generated-secret-key
DEBUG=False
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-key
CLOUDINARY_API_SECRET=your-cloudinary-secret
CORS_ALLOWED_ORIGINS=https://your-frontend-domain.com
```

### 3. Deploy

Railway will automatically:
- Install dependencies
- Run migrations
- Start your application

## Step 5: Verify Migration

### Check Railway Logs

1. Go to your Railway service
2. Check the logs for any errors
3. Look for successful migration messages

### Test Endpoints

1. **Health Check**: `https://your-app.railway.app/health/`
2. **API Docs**: `https://your-app.railway.app/api/docs/`
3. **Admin Panel**: `https://your-app.railway.app/admin/`

### Run Manual Commands (if needed)

```bash
# View logs
railway logs

# Run migrations manually
railway run python manage.py migrate

# Create superuser
railway run python manage.py createsuperuser

# Load data if needed
railway run python manage.py loaddata data_migration/sqlite_data.json
```

## Step 6: Update Frontend Configuration

Update your frontend to use the new Railway URL:

```typescript
// In your frontend config
const API_URL = 'https://your-app.railway.app';
```

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check environment variables are set correctly
   - Verify PostgreSQL service is running
   - Check Railway logs for connection details

2. **Migration Errors**
   - Ensure all migrations are up to date
   - Check for any custom SQL in migrations
   - Verify PostgreSQL extensions are available

3. **Data Loading Issues**
   - Check the JSON file format
   - Verify all required models are available
   - Check for any circular dependencies

4. **Performance Issues**
   - Add database indexes if needed
   - Optimize queries
   - Monitor Railway metrics

### Useful Commands

```bash
# Check database connection
railway run python manage.py dbshell

# Show migrations status
railway run python manage.py showmigrations

# Reset database (careful!)
railway run python manage.py flush

# Backup data
railway run python manage.py dumpdata > backup.json
```

## Environment Variables Reference

### Railway PostgreSQL (Auto-provided)

| Variable | Description |
|----------|-------------|
| `PGDATABASE` | Database name |
| `PGUSER` | Database user |
| `PGPASSWORD` | Database password |
| `PGHOST` | Database host |
| `PGPORT` | Database port |

### Local Development

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_NAME` | Database name | `ehcl_dev` |
| `DB_USER` | Database user | `postgres` |
| `DB_PASSWORD` | Database password | `postgres` |
| `DB_HOST` | Database host | `localhost` |
| `DB_PORT` | Database port | `5432` |

## Next Steps

After successful migration:

1. **Monitor Performance**: Use Railway's monitoring tools
2. **Set Up Backups**: Configure automatic database backups
3. **Optimize Queries**: Add indexes and optimize slow queries
4. **Scale**: Consider read replicas for high traffic
5. **Security**: Regularly rotate database credentials

## Rollback Plan

If you need to rollback:

1. **Keep SQLite backup**: Don't delete `db.sqlite3` immediately
2. **Export PostgreSQL data**: `railway run python manage.py dumpdata > postgres_backup.json`
3. **Test locally**: Verify everything works before deleting old data
4. **Monitor**: Watch for any issues after migration

## Security Considerations

1. **Environment Variables**: Never commit database credentials
2. **Connection Security**: Use SSL connections in production
3. **Access Control**: Limit database access to necessary users
4. **Backups**: Set up regular automated backups
5. **Monitoring**: Monitor for unusual database activity 