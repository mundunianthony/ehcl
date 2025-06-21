"""
ASGI config for myproject project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/howto/deployment/asgi/
"""

import os
from django.core.asgi import get_asgi_application

# Set the default settings module for production
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings.production')

# This application object is used by any ASGI server configured to use this file.
# It's used for ASGI servers like Daphne or Uvicorn.
django_application = get_asgi_application()

# Import websocket application here, so apps from django_application are loaded first
from channels.routing import ProtocolTypeRouter

# Import your WebSocket routing here when needed
# from your_app.routing import websocket_urlpatterns

application = ProtocolTypeRouter(
    {
        "http": django_application,
        # Just HTTP for now. (We can add other protocols later.)
        # "websocket": AuthMiddlewareStack(URLRouter(websocket_urlpatterns)),
    }
)
