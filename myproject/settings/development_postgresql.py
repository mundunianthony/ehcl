"""
Development settings with PostgreSQL for testing production-like environment.

This file contains settings for local development using PostgreSQL
to test the production database setup before deploying.
"""
import os
from .development import *  # noqa

# Override database settings to use PostgreSQL
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.getenv('DB_NAME', 'ehcl_dev'),
        'USER': os.getenv('DB_USER', 'postgres'),
        'PASSWORD': os.getenv('DB_PASSWORD', 'postgres'),
        'HOST': os.getenv('DB_HOST', 'localhost'),
        'PORT': os.getenv('DB_PORT', '5432'),
    }
}

# Print database configuration
print('\n' + '='*50)
print('USING POSTGRESQL FOR DEVELOPMENT')
print('='*50)
print(f'Database: {DATABASES["default"]["NAME"]}')
print(f'Host: {DATABASES["default"]["HOST"]}:{DATABASES["default"]["PORT"]}')
print(f'User: {DATABASES["default"]["USER"]}')
print('='*50 + '\n') 