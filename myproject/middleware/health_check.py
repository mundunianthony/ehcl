import time
import logging
from django.http import JsonResponse
from django.conf import settings

logger = logging.getLogger(__name__)

class HealthCheckMiddleware:
    """
    Middleware to handle health check endpoints and add performance metrics.
    """
    def __init__(self, get_response):
        self.get_response = get_response
        # One-time configuration and initialization
        self.health_check_paths = ['/health/', '/health', '/api/health/']

    def __call__(self, request):
        # Code to be executed for each request before
        # the view (and later middleware) are called.
        
        start_time = time.time()
        
        # Check if this is a health check request
        if request.path in self.health_check_paths:
            return self.process_health_check(request)
        
        # Process the request as normal
        response = self.get_response(request)
        
        # Calculate request time
        total_time = time.time() - start_time
        
        # Add performance headers
        response['X-Request-Time'] = f"{total_time:.4f}s"
        response['X-Server'] = f"{settings.SITE_NAME or 'Django'}"
        
        # Add CORS headers to all responses
        self.add_cors_headers(request, response)
        
        return response
    
    def add_cors_headers(self, request, response):
        """Add CORS headers to the response."""
        origin = request.META.get('HTTP_ORIGIN', '')
        
        # If the origin is in allowed origins, add CORS headers
        if origin and (settings.CORS_ALLOW_ALL_ORIGINS or 
                      origin in getattr(settings, 'CORS_ALLOWED_ORIGINS', [])):
            response['Access-Control-Allow-Origin'] = origin
            response['Access-Control-Allow-Methods'] = ', '.join(settings.CORS_ALLOW_METHODS)
            response['Access-Control-Allow-Headers'] = ', '.join(settings.CORS_ALLOW_HEADERS)
            if settings.CORS_ALLOW_CREDENTIALS:
                response['Access-Control-Allow-Credentials'] = 'true'
    
    def process_health_check(self, request):
        """Handle health check requests."""
        from django.db import connections
        from django.db.utils import OperationalError
        
        checks = {
            'database': False,
            'cache': False,
            'status': 'ok',
            'timestamp': time.time(),
            'debug': settings.DEBUG,
        }
        
        # Check database connection
        try:
            connections['default'].ensure_connection()
            checks['database'] = True
        except OperationalError as e:
            logger.error(f"Database connection failed: {e}")
            checks['status'] = 'error'
            checks['error'] = str(e)
        
        # Check cache
        try:
            from django.core.cache import cache
            cache.set('health_check', 'ok', 5)
            checks['cache'] = cache.get('health_check') == 'ok'
        except Exception as e:
            logger.error(f"Cache check failed: {e}")
            checks['status'] = 'error' if checks['status'] != 'error' else 'warning'
            checks['error'] = str(e)
        
        # Set appropriate status code
        status_code = 200 if checks['status'] == 'ok' else (503 if checks['status'] == 'error' else 206)
        
        return JsonResponse(checks, status=status_code)
