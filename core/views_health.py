import os
import platform
import time
import socket
from datetime import datetime
from django.conf import settings
from django.db import connections
from django.db.utils import OperationalError
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework import status

class HealthCheckView(APIView):
    """
    Enhanced health check endpoint for server discovery and system monitoring.
    Provides detailed information about the system status, database connectivity,
    and other important metrics.
    """
    permission_classes = [AllowAny]
    
    def get_system_info(self):
        """Collect system information."""
        return {
            'python_version': platform.python_version(),
            'platform': platform.platform(),
            'hostname': socket.gethostname(),
            'server_time': datetime.utcnow().isoformat() + 'Z',
            'environment': 'development' if settings.DEBUG else 'production',
            'debug': settings.DEBUG,
        }
    
    def check_database(self):
        """Check database connectivity."""
        try:
            connections['default'].ensure_connection()
            return {
                'status': 'ok',
                'engine': connections['default'].settings_dict['ENGINE'].split('.')[-1],
                'name': connections['default'].settings_dict.get('NAME', 'unknown'),
            }
        except OperationalError as e:
            return {
                'status': 'error',
                'error': str(e),
            }
    
    def check_cache(self):
        """Check cache connectivity."""
        try:
            from django.core.cache import cache
            cache_key = f'health_check_{int(time.time())}'
            cache.set(cache_key, 'ok', 5)
            return {
                'status': 'ok' if cache.get(cache_key) == 'ok' else 'error',
                'backend': settings.CACHES['default']['BACKEND'].split('.')[-1],
            }
        except Exception as e:
            return {
                'status': 'error',
                'error': str(e),
            }
    
    def get(self, request, *args, **kwargs):
        """Handle health check request."""
        start_time = time.time()
        
        # Collect all health information
        system_info = self.get_system_info()
        db_status = self.check_database()
        cache_status = self.check_cache()
        
        # Determine overall status
        overall_status = 'ok'
        if db_status.get('status') == 'error' or cache_status.get('status') == 'error':
            overall_status = 'error'
        
        # Prepare response data
        response_data = {
            'status': overall_status,
            'service': 'mobi-app-backend',
            'version': '1.0.0',
            'timestamp': datetime.utcnow().isoformat() + 'Z',
            'response_time_ms': int((time.time() - start_time) * 1000),
            'system': system_info,
            'database': db_status,
            'cache': cache_status,
            'endpoints': {
                'api': f'{request.scheme}://{request.get_host()}/api/',
                'admin': f'{request.scheme}://{request.get_host()}/admin/',
                'docs': f'{request.scheme}://{request.get_host()}/api/schema/swagger/',
            },
            'test_message': 'Django server is working correctly!',
        }
        
        # Set appropriate status code
        status_code = (
            status.HTTP_200_OK if overall_status == 'ok' 
            else status.HTTP_503_SERVICE_UNAVAILABLE
        )
        
        return Response(response_data, status=status_code)

class TestView(APIView):
    """
    Simple test endpoint to verify the server is working.
    """
    permission_classes = [AllowAny]
    
    def get(self, request, *args, **kwargs):
        """Simple test endpoint."""
        return Response({
            'message': 'Django server is working!',
            'timestamp': datetime.utcnow().isoformat() + 'Z',
            'request_path': request.path,
            'request_method': request.method,
            'user_agent': request.META.get('HTTP_USER_AGENT', 'Unknown'),
        }, status=status.HTTP_200_OK)
    
    def post(self, request, *args, **kwargs):
        """Test POST endpoint."""
        return Response({
            'message': 'POST request received successfully!',
            'data_received': request.data,
            'timestamp': datetime.utcnow().isoformat() + 'Z',
        }, status=status.HTTP_200_OK)
