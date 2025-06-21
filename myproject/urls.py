from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.views.generic import RedirectView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView

# Import health check view directly
from core.views_health import HealthCheckView

# Define URL patterns
urlpatterns = [
    # Admin site
    path('admin/', admin.site.urls),
    
    # Health check (available at multiple endpoints for convenience)
    path('health/', HealthCheckView.as_view(), name='health-check'),
    path('api/health/', HealthCheckView.as_view(), name='api-health-check'),
    
    # API endpoints
    path('api/', include('core.urls')),  # All your core app endpoints under /api/
    
    # Authentication
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # API Schema and Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
    
    # Redirect root to API documentation
    path('', RedirectView.as_view(url='/api/docs/', permanent=False)),
]

# Add debug toolbar if in development
if settings.DEBUG:
    try:
        import debug_toolbar
        urlpatterns = [
            path('__debug__/', include(debug_toolbar.urls)),
        ] + urlpatterns
    except ImportError:
        pass  # Debug toolbar not installed

# Serve media files in development
if settings.DEBUG:
    from django.conf.urls.static import static
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)