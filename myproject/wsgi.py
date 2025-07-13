"""
WSGI config for myproject project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/howto/deployment/wsgi/
"""

import os

from django.core.wsgi import get_wsgi_application

# Set default settings module based on environment
if os.environ.get('DJANGO_ENV') == 'railway':
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings.railway')
elif os.environ.get('DJANGO_ENV') == 'production':
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings.production')
else:
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings.development')

application = get_wsgi_application()

# Apply WSGI middleware here if needed
# from helloworld.wsgi import HelloWorldApplication
# application = HelloWorldApplication(application)