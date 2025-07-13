"""
Temporary settings for mobi-app to test delete functionality.

These settings remove problematic dependencies temporarily.
"""
from .base import *  # noqa

# Remove cloudinary and debug_toolbar from INSTALLED_APPS
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Third-party apps
    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',
    'corsheaders',
    'drf_spectacular',
    # 'cloudinary_storage',  # Temporarily disabled
    # 'cloudinary',  # Temporarily disabled
    
    # Local apps
    'core',
]

# Remove debug_toolbar middleware
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'myproject.middleware.HealthCheckMiddleware',
    # 'debug_toolbar.middleware.DebugToolbarMiddleware',  # Temporarily disabled
]

# Use local file storage instead of cloudinary
DEFAULT_FILE_STORAGE = 'django.core.files.storage.FileSystemStorage'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

# Allow all hosts in development
ALLOWED_HOSTS = ['*']

# CORS settings for development
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True

# Print important settings
print('\n' + '='*50)
print('RUNNING IN TEMPORARY MODE (NO CLOUDINARY/DEBUG_TOOLBAR)')
print('='*50)
print(f'DEBUG: {DEBUG}')
print(f'ALLOWED_HOSTS: {ALLOWED_HOSTS}')
print(f'DATABASES: {DATABASES["default"]["NAME"]}')
print('='*50 + '\n') 