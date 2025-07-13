from django.urls import path
from .views import (
    RegisterView, LoginView, LogoutView, CreateHealthCenterView, 
    AllHealthCentersView, HealthCenterDetailView, HospitalListView,
    UploadImageView, AvailableDistrictsView, NotificationView, UserDetailView,
    CreateNotificationView, EmergencyNotificationView, JWTAuthTestView,
    AppointmentViewSet, HospitalDashboardView, HospitalDashboardAuthView, HospitalRegisterView, 
    HospitalLoginView, HospitalProfileView
)
from .views_health import HealthCheckView, TestView
from rest_framework.routers import DefaultRouter

urlpatterns = [
    path('users/register/', RegisterView.as_view(), name='register'),
    path('users/login/', LoginView.as_view(), name='login'),
    path('users/logout/', LogoutView.as_view(), name='logout'),
    
    # Hospital authentication endpoints
    path('hospitals/register/', HospitalRegisterView.as_view(), name='hospital-register'),
    path('hospitals/login/', HospitalLoginView.as_view(), name='hospital-login'),
    path('hospital/profile/', HospitalProfileView.as_view(), name='hospital-profile'),
    path('hospital/dashboard/', HospitalDashboardAuthView.as_view(), name='hospital-dashboard-auth'),
    
    path('hospitals/create/', CreateHealthCenterView.as_view(), name='createHealthCenter'),
    path('hospitals/all/', AllHealthCentersView.as_view(), name='allHealthCenters'),
    path('hospitals/nearby/', HospitalListView.as_view(), name='nearbyHospitals'),
    path('hospitals/<int:id>/', HealthCenterDetailView.as_view(), name='healthCenterDetail'),
    path('hospitals/', HospitalListView.as_view(), name='hospital-list'),
    path('upload-image/', UploadImageView.as_view(), name='upload-image'),
    path('available-districts/', AvailableDistrictsView.as_view(), name='available-districts'),
    path('notifications/', NotificationView.as_view(), name='notifications'),
    path('notifications/create/', CreateNotificationView.as_view(), name='create-notification'),
    path('notifications/emergency/', EmergencyNotificationView.as_view(), name='emergency-notification'),
    path('notifications/<int:pk>/', NotificationView.as_view(), name='notification-detail'),
    
    # User details
    path('users/me/', UserDetailView.as_view(), name='user-details'),
    
    # JWT Authentication test
    path('jwt-test/', JWTAuthTestView.as_view(), name='jwt-auth-test'),
    
    # Health check endpoint for server discovery
    path('health/', HealthCheckView.as_view(), name='health-check'),
    
    # Test endpoint for debugging
    path('test/', TestView.as_view(), name='test'),
]

router = DefaultRouter()
router.register(r'appointments', AppointmentViewSet, basename='appointment')

urlpatterns += [
    path('hospital/<int:hospital_id>/dashboard/', HospitalDashboardView.as_view(), name='hospital-dashboard'),
]

urlpatterns += router.urls