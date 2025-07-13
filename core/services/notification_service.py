from django.core.exceptions import ObjectDoesNotExist
from django.utils import timezone
from ..models import Notification, User
from ..serializers import NotificationSerializer

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

def create_emergency_notification_for_all_staff(title, message, data=None):
    """
    Create an emergency notification for all staff users
    
    Args:
        title: Notification title
        message: Notification message
        data: Optional additional data to store with the notification
    
    Returns:
        List of created Notification instances
    """
    try:
        # Get all staff users
        staff_users = User.objects.filter(is_staff=True, is_active=True)
        
        notifications = []
        for user in staff_users:
            notification = create_notification(
                user=user,
                title=title,
                message=message,
                notification_type='emergency',
                data=data
            )
            notifications.append(notification)
        
        return notifications
    except Exception as e:
        raise Exception(f"Failed to create emergency notifications for staff: {str(e)}")

def create_emergency_notification_for_user_and_staff(user, title, message, data=None):
    """
    Create an emergency notification for a specific user and all staff users
    
    Args:
        user: User instance to receive the notification
        title: Notification title
        message: Notification message
        data: Optional additional data to store with the notification
    
    Returns:
        List of created Notification instances
    """
    try:
        notifications = []
        
        # Create notification for the specific user
        user_notification = create_notification(
            user=user,
            title=title,
            message=message,
            notification_type='emergency',
            data=data
        )
        notifications.append(user_notification)
        
        # Create notifications for all staff users (excluding the user if they are staff)
        staff_users = User.objects.filter(is_staff=True, is_active=True).exclude(id=user.id)
        
        for staff_user in staff_users:
            staff_notification = create_notification(
                user=staff_user,
                title=title,
                message=message,
                notification_type='emergency',
                data=data
            )
            notifications.append(staff_notification)
        
        return notifications
    except Exception as e:
        raise Exception(f"Failed to create emergency notifications: {str(e)}")

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
