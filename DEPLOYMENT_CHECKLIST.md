# Railway Deployment Checklist

## Pre-Deployment Checklist

### ✅ Files Created/Updated
- [ ] `Procfile` - Tells Railway how to run the app
- [ ] `runtime.txt` - Specifies Python version
- [ ] `railway.json` - Railway configuration
- [ ] `build.sh` - Build script
- [ ] `requirements.txt` - Updated with gunicorn, psycopg2-binary, whitenoise
- [ ] `myproject/settings/railway.py` - Railway-specific settings
- [ ] `myproject/settings/__init__.py` - Updated to include railway settings
- [ ] `manage.py` - Updated to use railway settings
- [ ] `myproject/wsgi.py` - Updated to use railway settings
- [ ] `myproject/asgi.py` - Updated to use railway settings

### ✅ Environment Variables to Set
- [ ] `DJANGO_ENV=railway`
- [ ] `SECRET_KEY` (generate using `python generate_secret_key.py`)
- [ ] `DEBUG=False`
- [ ] `CLOUDINARY_CLOUD_NAME`
- [ ] `CLOUDINARY_API_KEY`
- [ ] `CLOUDINARY_API_SECRET`
- [ ] `CORS_ALLOWED_ORIGINS` (your frontend URLs)

### ✅ Database Setup
- [ ] Add PostgreSQL service in Railway
- [ ] Railway will automatically provide:
  - [ ] `PGDATABASE`
  - [ ] `PGUSER`
  - [ ] `PGPASSWORD`
  - [ ] `PGHOST`
  - [ ] `PGPORT`

## Deployment Steps

### 1. Generate Secret Key
```bash
python generate_secret_key.py
```

### 2. Deploy to Railway
1. Go to [railway.app](https://railway.app)
2. Create new project
3. Connect your GitHub repository
4. Add PostgreSQL database
5. Set environment variables
6. Deploy

### 3. Verify Deployment
- [ ] Check Railway logs for any errors
- [ ] Visit your Railway URL
- [ ] Test health endpoint: `https://your-app.railway.app/health/`
- [ ] Test API docs: `https://your-app.railway.app/api/docs/`

### 4. Run Database Migrations
```bash
railway run python manage.py migrate
```

### 5. Create Superuser (Optional)
```bash
railway run python manage.py createsuperuser
```

## Post-Deployment Checklist

### ✅ Functionality Tests
- [ ] Health check endpoint works
- [ ] API documentation loads
- [ ] Database migrations completed
- [ ] Static files are served
- [ ] CORS is configured correctly
- [ ] Authentication endpoints work
- [ ] File uploads work (if using Cloudinary)

### ✅ Security Checks
- [ ] DEBUG is set to False
- [ ] SECRET_KEY is properly set
- [ ] HTTPS is enabled
- [ ] CORS origins are restricted
- [ ] Database credentials are secure

### ✅ Performance Checks
- [ ] Application starts within reasonable time
- [ ] Static files are compressed
- [ ] Database connections are working
- [ ] Logs are being generated

## Troubleshooting

### Common Issues and Solutions

1. **Build Fails**
   - Check `requirements.txt` has all dependencies
   - Verify Python version in `runtime.txt`

2. **Database Connection Error**
   - Ensure PostgreSQL service is running
   - Check environment variables are set correctly

3. **Static Files Not Loading**
   - Verify whitenoise is in requirements.txt
   - Check STATIC_ROOT is set correctly

4. **CORS Errors**
   - Add frontend domain to CORS_ALLOWED_ORIGINS
   - Check CORS_ALLOW_CREDENTIALS is True

5. **500 Internal Server Error**
   - Check Railway logs for detailed error
   - Verify all environment variables are set

## Useful Commands

```bash
# View logs
railway logs

# Run Django shell
railway run python manage.py shell

# Run migrations
railway run python manage.py migrate

# Create superuser
railway run python manage.py createsuperuser

# Collect static files
railway run python manage.py collectstatic

# Check environment variables
railway run env | grep DJANGO
```

## Next Steps After Deployment

1. **Update Frontend Configuration**
   - Change API URL to your Railway domain
   - Test all frontend functionality

2. **Set Up Monitoring**
   - Configure Railway alerts
   - Set up error tracking

3. **Domain Configuration**
   - Add custom domain if needed
   - Update CORS settings

4. **Backup Strategy**
   - Set up database backups
   - Configure log retention

5. **CI/CD Setup**
   - Configure automatic deployments
   - Set up testing pipeline 