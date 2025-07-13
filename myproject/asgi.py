"""
ASGI config for myproject project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/howto/deployment/asgi/
"""

import os

from django.core.asgi import get_asgi_application

# Set default settings module based on environment
if os.environ.get('DJANGO_ENV') == 'production':
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings.production')
else:
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings.development')

application = get_asgi_application()
