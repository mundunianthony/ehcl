"""
This package contains the Django settings for the mobi-app project.

It's split across multiple files for better organization:
- base.py: Common settings
- development.py: Development-specific settings
- production.py: Production-specific settings
"""

from .base import *  # noqa

# Import the appropriate settings based on the environment
import os

# Check if we're in production mode
# If DJANGO_SETTINGS_MODULE contains 'production', or DJANGO_ENV is 'production'
is_production = (
    'production' in os.environ.get('DJANGO_SETTINGS_MODULE', '') or
    os.environ.get('DJANGO_ENV') == 'production'
)

if is_production:
    from .production import *  # noqa
else:
    from .development import *  # noqa
