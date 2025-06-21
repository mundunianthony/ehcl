from django.core.exceptions import ObjectDoesNotExist
from django.utils import timezone
from .models import Notification
from .serializers import NotificationSerializer

def create_notification(user, title, message, notification_type, data=None):
    """
    Create a new notification for a user
    
    Args:
        user: User instance to receive the notification
        title: Notification title
        message: Notification message
        notification_type: Type of notification ('new_center', 'facility_update', 'system', 'account', 'emergency')
        data: Optional additional data to store with the notification
    
    Returns:
        Created Notification instance
    """
    try:
        notification = Notification.objects.create(
            user=user,
            title=title,
            message=message,
            notification_type=notification_type,
            data=data
        )
        return notification
    except Exception as e:
        raise Exception(f"Failed to create notification: {str(e)}")

def get_unread_notifications(user):
    """
    Get all unread notifications for a user
    
    Args:
        user: User instance
        
    Returns:
        List of unread notifications
    """
    return Notification.objects.filter(
        user=user,
        is_read=False
    ).order_by('-created_at')

def mark_notifications_as_read(user, notification_ids):
    """
    Mark specific notifications as read
    
    Args:
        user: User instance
        notification_ids: List of notification IDs to mark as read
        
    Returns:
        Number of notifications updated
    """
    return Notification.objects.filter(
        user=user,
        id__in=notification_ids
    ).update(is_read=True)

def create_nearby_hospital_notification(user, hospital, distance):
    """
    Create a notification for a nearby hospital
    
    Args:
        user: User instance
        hospital: HealthCenter instance
        distance: Distance in kilometers
        
    Returns:
        Created Notification instance
    """
    title = "Nearby Hospital Found"
    message = f"A new hospital is nearby: {hospital.name} ({distance:.1f}km away)"
    data = {
        'hospital_id': hospital.id,
        'hospital_name': hospital.name,
        'distance': distance
    }
    return create_notification(
        user=user,
        title=title,
        message=message,
        notification_type='new_center',
        data=data
    )
