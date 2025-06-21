from django.urls import path
from .views import (
    RegisterView, LoginView, LogoutView, CreateHealthCenterView, 
    AllHealthCentersView, HealthCenterDetailView, HospitalListView,
    UploadImageView, AvailableDistrictsView, NotificationView, UserDetailView,
    CreateNotificationView
)

urlpatterns = [
    path('users/register/', RegisterView.as_view(), name='register'),
    path('users/login/', LoginView.as_view(), name='login'),
    path('users/logout/', LogoutView.as_view(), name='logout'),
    path('hospitals/create/', CreateHealthCenterView.as_view(), name='createHealthCenter'),
    path('hospitals/all/', AllHealthCentersView.as_view(), name='allHealthCenters'),
    path('hospitals/nearby/', HospitalListView.as_view(), name='nearbyHospitals'),
    path('hospitals/<int:id>/', HealthCenterDetailView.as_view(), name='healthCenterDetail'),
    path('hospitals/', HospitalListView.as_view(), name='hospital-list'),
    path('upload-image/', UploadImageView.as_view(), name='upload-image'),
    path('available-districts/', AvailableDistrictsView.as_view(), name='available-districts'),
    path('notifications/', NotificationView.as_view(), name='notifications'),
    path('notifications/create/', CreateNotificationView.as_view(), name='create-notification'),
    
    # User details
    path('users/me/', UserDetailView.as_view(), name='user-details'),
]