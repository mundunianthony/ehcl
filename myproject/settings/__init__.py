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

if os.environ.get('DJANGO_ENV') == 'production':
    from .production import *  # noqa
else:
    from .development import *  # noqa
