"""
Railway-specific settings for the Django application.

This file contains settings that are specific to Railway deployment.
"""
import os
from .production import *  # noqa

# Railway-specific settings
DEBUG = os.getenv('DEBUG', 'False').lower() == 'true'

# Security settings for Railway
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'
SECURE_HSTS_SECONDS = 31536000  # 1 year
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

# Railway provides these environment variables
ALLOWED_HOSTS = [
    os.getenv('RAILWAY_STATIC_URL', ''),
    os.getenv('RAILWAY_PUBLIC_DOMAIN', ''),
    '.railway.app',
    '.up.railway.app',
]

# Filter out empty values
ALLOWED_HOSTS = [host for host in ALLOWED_HOSTS if host]

# CORS settings for Railway
CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOWED_ORIGINS = os.getenv('CORS_ALLOWED_ORIGINS', '').split(',')
CORS_ALLOWED_ORIGINS = [origin for origin in CORS_ALLOWED_ORIGINS if origin]

# Database configuration for Railway PostgreSQL
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.getenv('PGDATABASE'),
        'USER': os.getenv('PGUSER'),
        'PASSWORD': os.getenv('PGPASSWORD'),
        'HOST': os.getenv('PGHOST'),
        'PORT': os.getenv('PGPORT', '5432'),
    }
}

# Static files configuration for Railway
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# Add whitenoise for static file serving
MIDDLEWARE.insert(1, 'whitenoise.middleware.WhiteNoiseMiddleware')
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Logging configuration for Railway
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
        'simple': {
            'format': '{levelname} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'level': 'INFO',
            'class': 'logging.StreamHandler',
            'formatter': 'simple',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': True,
        },
        'core': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': True,
        },
    },
}

# JWT settings for Railway
SIMPLE_JWT.update({
    'SIGNING_KEY': os.getenv('SECRET_KEY', 'django-insecure-temporary-key-for-development-only'),
})

# Print Railway-specific settings
print('\n' + '='*50)
print('RUNNING ON RAILWAY')
print('='*50)
print(f'DEBUG: {DEBUG}')
print(f'ALLOWED_HOSTS: {ALLOWED_HOSTS}')
print(f'DATABASE: PostgreSQL on Railway')
print(f'STATIC_ROOT: {STATIC_ROOT}')
print('='*50 + '\n') 