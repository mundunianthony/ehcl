# Railway Deployment Guide

This guide will help you deploy your Django backend to Railway.

## Prerequisites

1. **Railway Account**: Sign up at [railway.app](https://railway.app)
2. **GitHub Repository**: Your code should be in a GitHub repository
3. **Railway CLI** (optional): Install with `npm install -g @railway/cli`

## Step 1: Prepare Your Repository

The following files have been created for Railway deployment:

- `Procfile`: Tells Railway how to run your Django app
- `runtime.txt`: Specifies Python version
- `railway.json`: Railway-specific configuration
- `build.sh`: Build script for deployment
- `myproject/settings/railway.py`: Railway-specific Django settings

## Step 2: Deploy to Railway

### Option A: Using Railway Dashboard (Recommended)

1. **Connect Repository**:
   - Go to [railway.app](https://railway.app)
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

2. **Add PostgreSQL Database**:
   - In your Railway project dashboard
   - Click "New" → "Database" → "PostgreSQL"
   - Railway will automatically provide database environment variables

3. **Configure Environment Variables**:
   - Go to your service settings
   - Add the following environment variables:

```bash
# Django Settings
DJANGO_ENV=railway
SECRET_KEY=your-secret-key-here
DEBUG=False

# Database (Railway provides these automatically)
PGDATABASE=your-database-name
PGUSER=your-database-user
PGPASSWORD=your-database-password
PGHOST=your-database-host
PGPORT=5432

# Cloudinary (for file uploads)
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# CORS Settings (add your frontend URLs)
CORS_ALLOWED_ORIGINS=https://your-frontend-domain.com,https://your-expo-app.com

# Email Settings (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=your-email@gmail.com
```

4. **Deploy**:
   - Railway will automatically detect your Django app
   - It will run the build process and deploy your application

### Option B: Using Railway CLI

1. **Install Railway CLI**:
   ```bash
   npm install -g @railway/cli
   ```

2. **Login to Railway**:
   ```bash
   railway login
   ```

3. **Initialize Project**:
   ```bash
   railway init
   ```

4. **Deploy**:
   ```bash
   railway up
   ```

## Step 3: Configure Domain

1. **Custom Domain** (Optional):
   - In your Railway project dashboard
   - Go to your service settings
   - Add a custom domain if needed

2. **Update CORS Settings**:
   - Add your custom domain to `CORS_ALLOWED_ORIGINS`
   - Update your frontend configuration to use the new API URL

## Step 4: Database Setup

Railway will automatically create a PostgreSQL database. The environment variables will be automatically set:

- `PGDATABASE`: Database name
- `PGUSER`: Database user
- `PGPASSWORD`: Database password
- `PGHOST`: Database host
- `PGPORT`: Database port (usually 5432)

## Step 5: Verify Deployment

1. **Check Logs**:
   - In Railway dashboard, go to your service
   - Check the logs for any errors

2. **Test Endpoints**:
   - Visit your Railway URL (e.g., `https://your-app.railway.app`)
   - Test your API endpoints

3. **Run Migrations**:
   - If needed, you can run migrations manually:
   ```bash
   railway run python manage.py migrate
   ```

## Step 6: Update Frontend Configuration

Update your frontend configuration to use the new Railway URL:

```typescript
// In your frontend config
const API_URL = 'https://your-app.railway.app';
```

## Environment Variables Reference

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DJANGO_ENV` | Django environment | `railway` |
| `SECRET_KEY` | Django secret key | `your-secret-key` |
| `DEBUG` | Debug mode | `False` |

### Database Variables (Auto-provided by Railway)

| Variable | Description |
|----------|-------------|
| `PGDATABASE` | Database name |
| `PGUSER` | Database user |
| `PGPASSWORD` | Database password |
| `PGHOST` | Database host |
| `PGPORT` | Database port |

### Optional Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | `your-cloud-name` |
| `CLOUDINARY_API_KEY` | Cloudinary API key | `your-api-key` |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | `your-api-secret` |
| `CORS_ALLOWED_ORIGINS` | Allowed CORS origins | `https://your-domain.com` |

## Troubleshooting

### Common Issues

1. **Build Failures**:
   - Check that all dependencies are in `requirements.txt`
   - Ensure Python version in `runtime.txt` is correct

2. **Database Connection Issues**:
   - Verify PostgreSQL service is running
   - Check environment variables are set correctly

3. **Static Files Not Loading**:
   - Ensure `whitenoise` is in `requirements.txt`
   - Check `STATIC_ROOT` is set correctly

4. **CORS Issues**:
   - Add your frontend domain to `CORS_ALLOWED_ORIGINS`
   - Check that `CORS_ALLOW_CREDENTIALS` is `True`

### Useful Commands

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
```

## Security Considerations

1. **Environment Variables**: Never commit sensitive data to your repository
2. **Secret Key**: Generate a strong secret key for production
3. **CORS**: Only allow necessary origins
4. **HTTPS**: Railway provides HTTPS by default
5. **Database**: Use Railway's managed PostgreSQL service

## Monitoring

Railway provides:
- **Logs**: View application logs in real-time
- **Metrics**: Monitor CPU, memory, and network usage
- **Alerts**: Set up alerts for service issues

## Next Steps

After successful deployment:
1. Test all API endpoints
2. Update your frontend to use the new API URL
3. Set up monitoring and alerts
4. Configure custom domain if needed
5. Set up CI/CD for automatic deployments 