from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.generics import RetrieveAPIView
from django.contrib.auth import authenticate, logout
from .models import User, HealthCenter, Notification
from .serializers import UserSerializer, HealthCenterSerializer, NotificationSerializer
from django.db.models import Q
import logging
import cloudinary.uploader
from datetime import timedelta
from django.utils import timezone
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from .services.notification_service import create_emergency_notification_for_user_and_staff
from drf_spectacular.utils import extend_schema, OpenApiResponse, OpenApiTypes, OpenApiExample
from .serializers import AppointmentSerializer
from .models import Appointment
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework_simplejwt.authentication import JWTAuthentication

logger = logging.getLogger(__name__)

# Authentication views
class LoginView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(
        request=OpenApiTypes.OBJECT,
        responses={
            200: OpenApiResponse(
                response=OpenApiTypes.OBJECT,
                description='Login successful',
                examples=[OpenApiExample('Login successful', value={
                    'refresh': 'jwt-refresh-token',
                    'access': 'jwt-access-token',
                    'user': {
                        'id': 1,
                        'email': 'user@example.com',
                        'name': 'John Doe'
                    }
                }, response_only=True)]
            ),
            401: OpenApiResponse(description='Invalid credentials')
        }
    )
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        
        logger.info(f"Login attempt for email: {email}")
        logger.info(f"Request data: {request.data}")
        logger.info(f"Request headers: {request.headers}")
        
        # Debug: Print the raw request data
        logger.debug(f"Raw request data: {request.data}")
        
        user = authenticate(email=email, password=password)
        if user is None:
            logger.error(f"Authentication failed for email: {email}")
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

        logger.info(f"Authentication successful for user: {user.email}")
        
        # Debug: Print user object before token generation
        logger.debug(f"Authenticated user: {user}")
        
        try:
            # Generate tokens
            refresh = RefreshToken.for_user(user)
            access = str(refresh.access_token)
            
            # Debug logging
            logger.debug(f"Generated refresh token: {str(refresh)}")
            logger.debug(f"Generated access token: {access}")
            
            # Get user data
            user_data = UserSerializer(user).data
            logger.debug(f"Serialized user data: {user_data}")
            
            # Prepare response
            response_data = {
                'refresh': str(refresh),
                'access': access,
                'user': user_data
            }
            
            logger.debug(f"Final response data: {response_data}")
            return Response(response_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error generating tokens: {str(e)}", exc_info=True)
            return Response(
                {'error': 'Failed to generate tokens'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class LogoutView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(
        request=OpenApiTypes.OBJECT,
        responses={
            200: OpenApiResponse(
                response=OpenApiTypes.OBJECT,
                description='Logout successful',
                examples=[OpenApiExample('Logout successful', value={'message': 'Successfully logged out'}, response_only=True)]
            ),
            400: OpenApiResponse(description='Invalid refresh token')
        }
    )
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh_token')
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({'message': 'Successfully logged out'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': 'Invalid refresh token'}, status=status.HTTP_400_BAD_REQUEST)

# User-related views
class RegisterView(APIView):
    permission_classes = [AllowAny]  # Explicitly public

    @extend_schema(
        request=OpenApiTypes.OBJECT,
        responses={
            201: OpenApiResponse(
                response=OpenApiTypes.OBJECT,
                description='User registered successfully',
                examples=[OpenApiExample('User registered successfully', value={
                    'message': 'User registered successfully',
                    'user': {
                        'id': 1,
                        'email': 'user@example.com',
                        'name': 'John Doe'
                    },
                    'tokens': {
                        'refresh': 'jwt-refresh-token',
                        'access': 'jwt-access-token'
                    }
                }, response_only=True)]
            ),
            400: OpenApiResponse(description='Validation error')
        }
    )
    def post(self, request):
        # Only require email and password for registration
        data = {
            'email': request.data.get('email'),
            'password': request.data.get('password'),
            'name': request.data.get('name', '')  # Optional name field
        }
        
        # Validate required fields
        if not data['email'] or not data['password']:
            return Response(
                {'error': 'Email and password are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check password length
        if len(data['password']) < 8:
            return Response(
                {'error': 'Password must be at least 8 characters long'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if user already exists
        if User.objects.filter(email=data['email']).exists():
            return Response(
                {'error': 'A user with this email already exists'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create the user
        serializer = UserSerializer(data=data)
        if serializer.is_valid():
            user = serializer.save()
            # Generate tokens for auto-login after registration
            refresh = RefreshToken.for_user(user)
            access = str(refresh.access_token)
            
            return Response({
                'message': 'User registered successfully',
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'name': user.name
                },
                'tokens': {
                    'refresh': str(refresh),
                    'access': access
                }
            }, status=status.HTTP_201_CREATED)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class BookVisitView(APIView):
    permission_classes = [AllowAny]  # Made public

    def post(self, request, id):
        email = request.data.get('email')
        date = request.data.get('date')
        try:
            user = User.objects.get(email=email)
            booked_visits = user.bookedVisits or []
            is_booked = any(visit.get('id') == id for visit in booked_visits)
            if is_booked:
                return Response({'message': 'selected residency already booked by you'}, status=status.HTTP_400_BAD_REQUEST)
            new_visit = {'id': id, 'date': date}
            booked_visits.append(new_visit)
            user.bookedVisits = booked_visits
            user.save()
            return Response({'message': 'visit booked successfully'})
        except User.DoesNotExist:
            return Response({'message': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

class AllBookingsView(APIView):
    permission_classes = [AllowAny]  # Made public

    def post(self, request):
        email = request.data.get('email')
        try:
            user = User.objects.get(email=email)
            return Response(user.bookedVisits or [], status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({'message': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

class CancelBookingView(APIView):
    permission_classes = [AllowAny]  # Made public

    def post(self, request, id):
        email = request.data.get('email')
        try:
            user = User.objects.get(email=email)
            booked_visits = user.bookedVisits or []
            booking_index = next((i for i, visit in enumerate(booked_visits) if visit.get('id') == id), -1)
            if booking_index == -1:
                return Response({'message': 'No Booking found'}, status=status.HTTP_404_NOT_FOUND)
            booked_visits.pop(booking_index)
            user.bookedVisits = booked_visits
            user.save()
            return Response({'message': 'Booking canceled'})
        except User.DoesNotExist:
            return Response({'message': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

class ToFavView(APIView):
    permission_classes = [AllowAny]  # Made public

    def post(self, request, rid):
        email = request.data.get('email')
        if not email:
            return Response({'message': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            user = User.objects.get(email=email)
            fav_residencies = user.favResidenciesID or []
            if rid in fav_residencies:
                fav_residencies.remove(rid)
                user.favResidenciesID = fav_residencies
                user.save()
                return Response({'message': 'Removed from favourite', 'user': UserSerializer(user).data})
            else:
                fav_residencies.append(rid)
                user.favResidenciesID = fav_residencies
                user.save()
                return Response({'message': 'Updated favorites', 'user': UserSerializer(user).data})
        except User.DoesNotExist:
            return Response({'message': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

class AllFavView(APIView):
    permission_classes = [AllowAny]  # Made public

    def post(self, request):
        email = request.data.get('email')
        try:
            user = User.objects.get(email=email)
            return Response(user.favResidenciesID or [], status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({'message': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

# Health center-related views
class HospitalListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        # Get query parameters
        search = request.query_params.get('search', '')
        district = request.query_params.get('district', None)
        specialty = request.query_params.get('specialty', None)
        condition = request.query_params.get('condition', None)  # New condition parameter
        
        # Debug logging
        logger.info(f"Received district filter: {district}")
        logger.info(f"Received condition filter: {condition}")
        
        # Service filters
        emergency = request.query_params.get('emergency', '').lower() == 'true'
        ambulance = request.query_params.get('ambulance', '').lower() == 'true'
        pharmacy = request.query_params.get('pharmacy', '').lower() == 'true'
        lab = request.query_params.get('lab', '').lower() == 'true'
        
        # Start with all hospitals
        hospitals = HealthCenter.objects.all()
        
        # Apply search filter if provided
        if search:
            hospitals = hospitals.filter(
                Q(name__icontains=search) | 
                Q(description__icontains=search) | 
                Q(address__icontains=search) |
                Q(specialties__icontains=search) |
                Q(conditions_treated__icontains=search)
            )
            
        # Apply district filter if provided
        if district:
            # Clean the district name
            cleaned_district = district.strip()
            logger.info(f"Filtering by cleaned district: {cleaned_district}")
            
            # Get all hospitals in this district using case-insensitive contains
            hospitals = hospitals.filter(
                Q(city__icontains=cleaned_district)
            )
            
            # Debug logging
            logger.info(f"Found {hospitals.count()} hospitals in district {cleaned_district}")
            if hospitals.count() > 0:
                logger.info(f"First few hospitals found: {[h.name for h in hospitals[:5]]}")
            
        # Apply specialty filter if provided
        if specialty:
            hospitals = hospitals.filter(
                Q(specialties__icontains=specialty)
            )
            
        # Apply condition filter if provided
        if condition:
            hospitals = hospitals.filter(
                Q(conditions_treated__icontains=condition)
            )
            logger.info(f"Filtering by condition: {condition}")
            
        # Apply service filters
        if emergency:
            hospitals = hospitals.filter(is_emergency=True)
        if ambulance:
            hospitals = hospitals.filter(has_ambulance=True)
        if pharmacy:
            hospitals = hospitals.filter(has_pharmacy=True)
        if lab:
            hospitals = hospitals.filter(has_lab=True)
        
        # Order the results
        hospitals = hospitals.order_by('name')
        
        # Debug logging
        logger.info(f"Final query returned {hospitals.count()} hospitals")
        if hospitals.count() > 0:
            logger.info(f"First few hospitals in final result: {[h.name for h in hospitals[:5]]}")
        
        serializer = HealthCenterSerializer(hospitals, many=True)
        return Response(serializer.data)

class NotificationView(APIView):
    """Handle notifications for the current user"""
    permission_classes = [AllowAny]  # Allow both authenticated and unauthenticated access
    
    @extend_schema(
        responses={
            200: OpenApiResponse(
                response=OpenApiTypes.OBJECT,
                description='List of notifications',
                examples=[OpenApiExample('List of notifications', value={
                    'results': [
                        {
                            'id': 1,
                            'title': 'Test Notification',
                            'message': 'This is a test',
                            'is_read': False,
                            'created_at': '2024-01-01T00:00:00Z',
                        }
                    ],
                    'count': 1,
                    'unread_count': 1,
                    'page': 1,
                    'total_pages': 1
                }, response_only=True)]
            ),
            401: OpenApiResponse(description='Authentication required or user_email parameter needed'),
            404: OpenApiResponse(description='User not found')
        }
    )
    def get(self, request):
        """Get all notifications for the current user"""
        # Try to get user from authentication first
        user = request.user if request.user.is_authenticated else None
        
        # If no authenticated user, try to get user by email from query params
        if not user:
            user_email = request.query_params.get('user_email')
            if user_email:
                try:
                    user = User.objects.get(email=user_email)
                except User.DoesNotExist:
                    return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
            else:
                return Response({'error': 'Authentication required or user_email parameter needed'}, status=status.HTTP_401_UNAUTHORIZED)

        notifications = Notification.objects.filter(user=user).order_by('-created_at')
        unread_count = notifications.filter(is_read=False).count()
        
        # Paginate the results
        page = request.query_params.get('page', 1)
        page_size = request.query_params.get('page_size', 10)
        
        start_index = (int(page) - 1) * int(page_size)
        end_index = start_index + int(page_size)
        
        paginated_notifications = notifications[start_index:end_index]
        serializer = NotificationSerializer(paginated_notifications, many=True)
        
        return Response({
            'results': serializer.data,
            'count': notifications.count(),
            'unread_count': unread_count,
            'page': int(page),
            'total_pages': (notifications.count() + int(page_size) - 1) // int(page_size)
        })

    @extend_schema(
        request=OpenApiTypes.OBJECT,
        responses={
            200: OpenApiResponse(
                response=OpenApiTypes.OBJECT,
                description='Notifications marked as read',
                examples=[OpenApiExample('Notifications marked as read', value={'message': 'Notifications marked as read. Updated: 1', 'updated_ids': [1]})]
            ),
            400: OpenApiResponse(description='No notification IDs provided'),
            401: OpenApiResponse(description='Authentication required or user_email parameter needed'),
            404: OpenApiResponse(description='User not found')
        }
    )
    def post(self, request):
        """Mark notifications as read"""
        notification_ids = request.data.get('notification_ids', [])
        
        # Debug logging
        logger.info(f"Notification markAsRead request - Headers: {dict(request.headers)}")
        logger.info(f"Notification markAsRead request - User authenticated: {request.user.is_authenticated}")
        logger.info(f"Notification markAsRead request - User: {request.user}")
        logger.info(f"Notification markAsRead request - Data: {request.data}")
        
        # Check JWT authentication specifically
        auth_header = request.headers.get('Authorization', '')
        logger.info(f"Authorization header: {auth_header}")
        
        if auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
            logger.info(f"JWT token received: {token[:20]}...")
            
            # Try to decode the token manually to see if it's valid
            try:
                access_token = AccessToken(token)
                user_id = access_token['user_id']
                logger.info(f"JWT token decoded successfully - user_id: {user_id}")
                
                # Try to get the user
                try:
                    user_from_token = User.objects.get(id=user_id)
                    logger.info(f"User found from JWT token: {user_from_token.email}")
                    # Set the user for this request
                    request.user = user_from_token
                    user = user_from_token
                except User.DoesNotExist:
                    logger.error(f"User with ID {user_id} not found in database")
            except (InvalidToken, TokenError) as e:
                logger.error(f"JWT token validation failed: {str(e)}")
        else:
            logger.warning("No Bearer token found in Authorization header")
        
        # Try to get user from authentication first
        user = request.user if request.user.is_authenticated else None
        
        if not notification_ids:
            return Response(
                {'error': 'No notification IDs provided'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # If no authenticated user, try to get user by email from request data
        if not user:
            user_email = request.data.get('user_email')
            if user_email:
                try:
                    user = User.objects.get(email=user_email)
                    logger.info(f"Found user by email: {user.email}")
                except User.DoesNotExist:
                    logger.error(f"User not found for email: {user_email}")
                    return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
            else:
                logger.error("No authenticated user and no user_email provided")
                return Response({'error': 'Authentication required or user_email parameter needed'}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            notifications = user.notifications.filter(id__in=notification_ids)
            updated_count = notifications.update(is_read=True)
            # Add logging for debugging
            logger.info(f"Marking notifications as read for user {user.email}: IDs={notification_ids}, Updated={updated_count}")
            return Response(
                {'message': f'Notifications marked as read. Updated: {updated_count}', 'updated_ids': list(notifications.values_list('id', flat=True))},
                status=status.HTTP_200_OK
            )
        except Exception as e:
            logger.error(f"Error marking notifications as read for user {getattr(user, 'email', None)}: {str(e)}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @extend_schema(
        responses={
            204: OpenApiResponse(description='No content')
        }
    )
    def delete(self, request, pk=None):
        """Delete a notification by ID for the current user"""
        # Debug logging
        logger.info(f"Notification delete request - Headers: {dict(request.headers)}")
        logger.info(f"Notification delete request - User authenticated: {request.user.is_authenticated}")
        logger.info(f"Notification delete request - User: {request.user}")
        logger.info(f"Notification delete request - Query params: {dict(request.query_params)}")
        logger.info(f"Notification delete request - Data: {request.data}")
        
        # Check JWT authentication specifically
        auth_header = request.headers.get('Authorization', '')
        logger.info(f"Authorization header: {auth_header}")
        
        if auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
            logger.info(f"JWT token received: {token[:20]}...")
            
            # Try to decode the token manually to see if it's valid
            try:
                access_token = AccessToken(token)
                user_id = access_token['user_id']
                logger.info(f"JWT token decoded successfully - user_id: {user_id}")
                
                # Try to get the user
                try:
                    user_from_token = User.objects.get(id=user_id)
                    logger.info(f"User found from JWT token: {user_from_token.email}")
                    # Set the user for this request
                    request.user = user_from_token
                    user = user_from_token
                except User.DoesNotExist:
                    logger.error(f"User with ID {user_id} not found in database")
            except (InvalidToken, TokenError) as e:
                logger.error(f"JWT token validation failed: {str(e)}")
        else:
            logger.warning("No Bearer token found in Authorization header")
        
        # Try to get user from authentication first
        user = request.user if request.user.is_authenticated else None
        
        # If no authenticated user, try to get user by email from query params or data
        user_email = request.query_params.get('user_email') or request.data.get('user_email')
        if not user and user_email:
            try:
                user = User.objects.get(email=user_email)
                logger.info(f"Found user by email: {user.email}")
            except User.DoesNotExist:
                logger.error(f"User not found for email: {user_email}")
                return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        if not user:
            logger.error("No authenticated user and no user_email provided")
            return Response({'error': 'Authentication required or user_email parameter needed'}, status=status.HTTP_401_UNAUTHORIZED)

        # Get notification ID from URL or data
        notification_id = pk or request.query_params.get('id') or request.data.get('id')
        if not notification_id:
            logger.error("No notification ID provided")
            return Response({'error': 'Notification ID required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # First check if the notification exists
            notification = Notification.objects.get(id=notification_id, user=user)
            logger.info(f"Found notification {notification_id} for user {user.email}")
        except Notification.DoesNotExist:
            # Check if notification exists but belongs to different user
            try:
                other_notification = Notification.objects.get(id=notification_id)
                logger.warning(f"Notification {notification_id} exists but belongs to user {other_notification.user.email}, not {user.email}")
                return Response({'error': 'Notification not found'}, status=status.HTTP_404_NOT_FOUND)
            except Notification.DoesNotExist:
                logger.warning(f"Notification {notification_id} does not exist in database")
                # Return success even if notification doesn't exist (idempotent delete)
                return Response({'message': 'Notification already deleted or not found'}, status=status.HTTP_200_OK)
        
        try:
            notification.delete()
            logger.info(f"Successfully deleted notification {notification_id} for user {user.email}")
            return Response({'message': 'Notification deleted successfully'}, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error deleting notification {notification_id} for user {getattr(user, 'email', None)}: {str(e)}")
            return Response({'error': f'Failed to delete notification: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class CreateNotificationView(APIView):
    """Create a simple notification"""
    permission_classes = [AllowAny]  # Allow anyone to create notifications
    
    @extend_schema(
        request=OpenApiTypes.OBJECT,
        responses={
            201: NotificationSerializer,
            200: OpenApiResponse(
                response=OpenApiTypes.OBJECT,
                description='Notification already exists',
                examples=[OpenApiExample('Notification already exists', value={'message': 'Notification already exists', 'notification': {}}, response_only=True)]
            ),
            400: OpenApiResponse(description='User email is required'),
            404: OpenApiResponse(description='User not found'),
            500: OpenApiResponse(description='Internal server error')
        }
    )
    def post(self, request):
        """Create a new notification"""
        try:
            # Get user email from request
            user_email = request.data.get('user_email')
            if not user_email:
                return Response(
                    {'error': 'User email is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Find the user
            try:
                user = User.objects.get(email=user_email)
            except User.DoesNotExist:
                return Response(
                    {'error': 'User not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Check if notification already exists (to prevent duplicates)
            title = request.data.get('title', 'New Notification')
            message = request.data.get('message', 'You have a new notification')
            
            # Check for duplicate notifications in the last 5 minutes
            recent_duplicate = Notification.objects.filter(
                user=user,
                title=title,
                message=message,
                created_at__gte=timezone.now() - timedelta(minutes=5)
            ).first()
            
            if recent_duplicate:
                return Response(
                    {'message': 'Notification already exists', 'notification': NotificationSerializer(recent_duplicate).data},
                    status=status.HTTP_200_OK
                )
            
            # Create notification
            notification = Notification.objects.create(
                user=user,
                title=title,
                message=message,
                notification_type=request.data.get('type', 'system'),
                data=request.data.get('data', {})
            )
            
            serializer = NotificationSerializer(notification)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class EmergencyNotificationView(APIView):
    """Create emergency notifications for user and all staff"""
    permission_classes = [AllowAny]  # Allow anyone to create emergency notifications
    
    @extend_schema(
        request=OpenApiTypes.OBJECT,
        responses={
            201: OpenApiResponse(
                response=OpenApiTypes.OBJECT,
                description='Emergency notifications created',
                examples=[OpenApiExample('Emergency notifications created', value={
                    'message': 'Emergency notifications created successfully',
                    'notifications_created': 2,
                    'notifications': [
                        {
                            'id': 1,
                            'title': 'Emergency',
                            'message': 'This is an emergency',
                            'is_read': False,
                            'created_at': '2024-01-01T00:00:00Z',
                        }
                    ]
                }, response_only=True)]
            ),
            400: OpenApiResponse(description='User email is required'),
            404: OpenApiResponse(description='User not found'),
            500: OpenApiResponse(description='Failed to create emergency notifications')
        }
    )
    def post(self, request):
        """Create emergency notifications for user and all staff users"""
        try:
            # Get user email from request
            user_email = request.data.get('user_email')
            if not user_email:
                return Response(
                    {'error': 'User email is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Find the user
            try:
                user = User.objects.get(email=user_email)
            except User.DoesNotExist:
                return Response(
                    {'error': 'User not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Get notification details
            title = request.data.get('title', 'Emergency Alert')
            message = request.data.get('message', 'Emergency notification')
            data = request.data.get('data', {})
            
            # Import the notification service
            from .services.notification_service import create_emergency_notification_for_user_and_staff
            
            # Create notifications for user and all staff
            notifications = create_emergency_notification_for_user_and_staff(
                user=user,
                title=title,
                message=message,
                data=data
            )
            
            # Serialize the notifications
            serialized_notifications = [NotificationSerializer(n).data for n in notifications]
            
            return Response({
                'message': 'Emergency notifications created successfully',
                'notifications_created': len(notifications),
                'notifications': serialized_notifications
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"Error creating emergency notifications: {str(e)}", exc_info=True)
            return Response(
                {'error': f'Failed to create emergency notifications: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class AvailableDistrictsView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(
        responses={
            200: OpenApiResponse(
                response=OpenApiTypes.OBJECT,
                description='A list of available districts',
                examples=[OpenApiExample('A list of available districts', value={
                    'success': True,
                    'districts': ['Kampala', 'Mbarara', 'Jinja']
                }, response_only=True)]
            )
        }
    )
    def get(self, request):
        # Get all unique districts from the database and clean them
        districts = HealthCenter.objects.exclude(
            Q(city__isnull=True) | Q(city='')
        ).values_list('city', flat=True).distinct()
        
        # Clean and normalize district names
        available_districts = set()
        for district in districts:
            # Clean the district name
            cleaned_district = district.strip()
            if cleaned_district:
                available_districts.add(cleaned_district)
        
        # Convert to sorted list
        available_districts = sorted(list(available_districts))
        
        # Debug logging
        logger.info(f"Available districts: {available_districts}")
        
        # Return the districts in the response
        return Response({
            'success': True,
            'districts': available_districts
        }, status=status.HTTP_200_OK)

class CreateHealthCenterView(APIView):
    permission_classes = [AllowAny]  # Public

    @extend_schema(
        request=OpenApiTypes.OBJECT,
        responses={
            201: OpenApiResponse(
                response=OpenApiTypes.OBJECT,
                description='Health center created',
                examples=[OpenApiExample('Health center created', value={
                    'message': 'Health center created',
                    'health_center': {
                        'id': 1,
                        'name': 'Sample Hospital',
                        'city': 'Kampala',
                        'address': '123 Main St',
                        'description': 'A great hospital',
                        'email': 'info@sample.com',
                        'phone': '+256700000000',
                        'coords': {'latitude': 0.3476, 'longitude': 32.5825}
                    }
                }, response_only=True)]
            ),
            400: OpenApiResponse(description='Validation error')
        }
    )
    def post(self, request):
        # Clean phone number before saving
        phone = request.data.get('phone', '').strip()
        if phone:
            # Remove spaces and keep only digits and +
            cleaned_phone = ''.join(c for c in phone if c.isdigit() or c == '+')
            request.data['phone'] = cleaned_phone
        
        serializer = HealthCenterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'Health center created', 'health_center': serializer.data}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AllHealthCentersView(APIView):
    permission_classes = [AllowAny]  # Public

    @extend_schema(
        responses={
            200: HealthCenterSerializer(many=True)
        }
    )
    def get(self, request):
        # Get query parameters
        search = request.query_params.get('search', '').strip()
        district = request.query_params.get('district', '').strip()
        
        # Start with all health centers
        centers = HealthCenter.objects.all()
        
        # Apply search filter if provided
        if search:
            centers = centers.filter(
                Q(name__icontains=search) |
                Q(description__icontains=search) |
                Q(address__icontains=search) |
                Q(city__icontains=search)
            )
        
        # Apply district filter if provided
        if district:
            centers = centers.filter(
                Q(city__iexact=district) |
                Q(district__iexact=district)
            )
        
        # Order and serialize the results
        centers = centers.order_by('name')
        serializer = HealthCenterSerializer(centers, many=True)
        return Response(serializer.data)

class HealthCenterDetailView(APIView):
    permission_classes = [AllowAny]  # Public

    @extend_schema(
        responses={
            200: HealthCenterSerializer,
            404: OpenApiResponse(description='Health center not found')
        }
    )
    def get(self, request, id):
        try:
            center = HealthCenter.objects.get(id=id)
            serializer = HealthCenterSerializer(center)
            return Response(serializer.data)
        except HealthCenter.DoesNotExist:
            return Response({'message': 'Health center not found'}, status=status.HTTP_404_NOT_FOUND)

class UserDetailView(RetrieveAPIView):
    """
    View to return the current user's details.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user


class UploadImageView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(
        request={
            'multipart/form-data': {
                'type': 'object',
                'properties': {
                    'image': {'type': 'string', 'format': 'binary', 'description': 'Image file to upload'}
                },
                'required': ['image']
            }
        },
        responses={
            200: OpenApiResponse(
                response=OpenApiTypes.OBJECT,
                description='Image uploaded successfully',
                examples=[OpenApiExample('Image uploaded successfully', value={'image_url': 'https://res.cloudinary.com/demo/image/upload/sample.jpg'}, response_only=True)]
            ),
            400: OpenApiResponse(description='No image file provided'),
            500: OpenApiResponse(description='Failed to upload image')
        }
    )
    def post(self, request):
        try:
            if 'image' not in request.FILES:
                return Response(
                    {'error': 'No image file provided'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            image_file = request.FILES['image']
            
            # Upload to Cloudinary
            result = cloudinary.uploader.upload(
                image_file,
                folder="hospital_images",
                resource_type="image"
            )
            
            # Return the Cloudinary URL
            return Response({
                'image_url': result['secure_url']
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error uploading image: {str(e)}", exc_info=True)
            return Response(
                {'error': 'Failed to upload image'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class JWTAuthTestView(APIView):
    """Test endpoint to verify JWT authentication"""
    permission_classes = [AllowAny]

    @extend_schema(
        responses={
            200: OpenApiResponse(
                response=OpenApiTypes.OBJECT,
                description='JWT authentication status',
                examples=[OpenApiExample('JWT authentication status', value={
                    'message': 'JWT authentication working',
                    'user': 'user@example.com',
                    'user_id': 1,
                    'authenticated': True
                }, response_only=True), OpenApiExample('No JWT token provided', value={'message': 'No JWT token provided', 'authenticated': False}, response_only=True)]
            ),
            401: OpenApiResponse(description='JWT token invalid or not provided')
        }
    )
    def get(self, request):
        """Test JWT authentication status"""
        logger.info(f"JWT Auth Test - Headers: {dict(request.headers)}")
        logger.info(f"JWT Auth Test - User authenticated: {request.user.is_authenticated}")
        logger.info(f"JWT Auth Test - User: {request.user}")
        
        auth_header = request.headers.get('Authorization', '')
        logger.info(f"JWT Auth Test - Authorization header: {auth_header}")
        
        if auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
            logger.info(f"JWT Auth Test - Token received: {token[:20]}...")
            
            try:
                access_token = AccessToken(token)
                user_id = access_token['user_id']
                logger.info(f"JWT Auth Test - Token decoded successfully - user_id: {user_id}")
                
                try:
                    user_from_token = User.objects.get(id=user_id)
                    logger.info(f"JWT Auth Test - User found: {user_from_token.email}")
                    return Response({
                        'message': 'JWT authentication working',
                        'user': user_from_token.email,
                        'user_id': user_id,
                        'authenticated': True
                    })
                except User.DoesNotExist:
                    logger.error(f"JWT Auth Test - User with ID {user_id} not found")
                    return Response({
                        'message': 'JWT token valid but user not found',
                        'user_id': user_id,
                        'authenticated': False
                    })
            except (InvalidToken, TokenError) as e:
                logger.error(f"JWT Auth Test - Token validation failed: {str(e)}")
                return Response({
                    'message': 'JWT token invalid',
                    'error': str(e),
                    'authenticated': False
                })
        else:
            logger.warning("JWT Auth Test - No Bearer token found")
            return Response({
                'message': 'No JWT token provided',
                'authenticated': False
            })

class AppointmentViewSet(viewsets.ModelViewSet):
    queryset = Appointment.objects.all().order_by('-created_at')
    serializer_class = AppointmentSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        # Set user from request if authenticated, else require in data
        user = self.request.user if self.request.user.is_authenticated else None
        if user:
            appointment = serializer.save(user=user)
        else:
            appointment = serializer.save()
        # Notify user of successful booking
        Notification.objects.create(
            user=appointment.user,
            title='Appointment Submitted',
            message=f"Your appointment at {appointment.hospital.name} on {appointment.date.strftime('%Y-%m-%d %H:%M')} has been submitted and is pending approval.",
            notification_type='appointment',
        )

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated:
            # If user is a hospital staff member, show appointments for their hospital
            if user.is_staff:
                try:
                    hospital = user.hospital
                    return Appointment.objects.filter(hospital_id=hospital.id).order_by('-created_at')
                except HealthCenter.DoesNotExist:
                    return Appointment.objects.none()
            else:
                # Regular users see only their own appointments
                return Appointment.objects.filter(user=user).order_by('-created_at')
        return Appointment.objects.none()

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        appointment = self.get_object()
        # Check if user is authorized to approve this appointment
        user = request.user
        if user.is_staff:
            try:
                hospital = user.hospital
                if appointment.hospital_id != hospital.id:
                    return Response({'error': 'Not authorized to approve this appointment'}, status=403)
            except HealthCenter.DoesNotExist:
                return Response({'error': 'Hospital not found'}, status=404)
        else:
            return Response({'error': 'Not authorized to approve appointments'}, status=403)
        
        appointment.status = 'confirmed'
        appointment.save()
        # Notify user
        Notification.objects.create(
            user=appointment.user,
            title='Appointment Approved',
            message=f"Your appointment at {appointment.hospital.name} on {appointment.date.strftime('%Y-%m-%d %H:%M')} has been approved.",
            notification_type='appointment',
        )
        return Response({'status': 'approved', 'appointment': AppointmentSerializer(appointment).data})

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        appointment = self.get_object()
        # Check if user is authorized to reject this appointment
        user = request.user
        if user.is_staff:
            try:
                hospital = user.hospital
                if appointment.hospital_id != hospital.id:
                    return Response({'error': 'Not authorized to reject this appointment'}, status=403)
            except HealthCenter.DoesNotExist:
                return Response({'error': 'Hospital not found'}, status=404)
        else:
            return Response({'error': 'Not authorized to reject appointments'}, status=403)
        
        appointment.status = 'cancelled'
        appointment.save()
        # Notify user
        Notification.objects.create(
            user=appointment.user,
            title='Appointment Rejected',
            message=f"Your appointment at {appointment.hospital.name} on {appointment.date.strftime('%Y-%m-%d %H:%M')} has been rejected.",
            notification_type='appointment',
        )
        return Response({'status': 'rejected', 'appointment': AppointmentSerializer(appointment).data})

class HospitalDashboardView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, hospital_id):
        appointments = Appointment.objects.filter(hospital_id=hospital_id).order_by('-created_at')
        serializer = AppointmentSerializer(appointments, many=True)
        return Response(serializer.data)

    def delete(self, request, hospital_id):
        deleted_count, _ = Appointment.objects.filter(hospital_id=hospital_id).delete()
        return Response({'message': f'Deleted {deleted_count} appointments.'}, status=200)

class HospitalDashboardAuthView(APIView):
    """Hospital dashboard view that gets hospital_id from authenticated user"""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            hospital = request.user.hospital
            appointments = Appointment.objects.filter(hospital_id=hospital.id).order_by('-created_at')
            serializer = AppointmentSerializer(appointments, many=True)
            return Response(serializer.data)
        except HealthCenter.DoesNotExist:
            return Response(
                {'error': 'No hospital found for this user'}, 
                status=status.HTTP_404_NOT_FOUND
            )

    def delete(self, request):
        try:
            hospital = request.user.hospital
            deleted_count, _ = Appointment.objects.filter(hospital_id=hospital.id).delete()
            return Response({'message': f'Deleted {deleted_count} appointments.'}, status=200)
        except HealthCenter.DoesNotExist:
            return Response(
                {'error': 'No hospital found for this user'}, 
                status=status.HTTP_404_NOT_FOUND
            )

# Hospital Authentication Views
class HospitalRegisterView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(
        request=OpenApiTypes.OBJECT,
        responses={
            201: OpenApiResponse(
                response=OpenApiTypes.OBJECT,
                description='Hospital registered successfully',
                examples=[OpenApiExample('Hospital registered successfully', value={
                    'message': 'Hospital registered successfully',
                    'hospital': {
                        'id': 1,
                        'name': 'Sample Hospital',
                        'email': 'hospital@example.com'
                    },
                    'tokens': {
                        'refresh': 'jwt-refresh-token',
                        'access': 'jwt-access-token'
                    }
                }, response_only=True)]
            ),
            400: OpenApiResponse(description='Validation error')
        }
    )
    def post(self, request):
        # Extract user credentials
        user_email = request.data.get('user_email')
        password = request.data.get('password')
        
        # Validate required fields
        if not user_email or not password:
            return Response(
                {'error': 'Email and password are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if user already exists
        if User.objects.filter(email=user_email).exists():
            return Response(
                {'error': 'A user with this email already exists'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Create user account for hospital
            user = User.objects.create_user(
                email=user_email,
                password=password,
                name=user_email.split('@')[0],  # Use email prefix as name
                is_staff=True  # Hospitals are staff users
            )
            
            # Create hospital with default values
            hospital = HealthCenter.objects.create(
                hospital_user=user,
                name=f"Hospital {user_email.split('@')[0]}",  # Generate name from email
                description="Hospital created via registration",
                address="Address to be updated",
                city="City to be updated",
                country="Uganda",
                email=user_email,
                phone="+256 000 000000",
                is_emergency=True,
                has_ambulance=False,
                has_pharmacy=True,
                has_lab=False,
                specialties="",
                conditions_treated="",
            )
            
            # Generate tokens
            refresh = RefreshToken.for_user(user)
            access = str(refresh.access_token)
            
            return Response({
                'message': 'Hospital registered successfully',
                'hospital': {
                    'id': hospital.id,
                    'name': hospital.name,
                    'email': hospital.email
                },
                'tokens': {
                    'refresh': str(refresh),
                    'access': access
                }
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"Error registering hospital: {str(e)}", exc_info=True)
            return Response(
                {'error': 'Failed to register hospital'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class HospitalLoginView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(
        request=OpenApiTypes.OBJECT,
        responses={
            200: OpenApiResponse(
                response=OpenApiTypes.OBJECT,
                description='Hospital login successful',
                examples=[OpenApiExample('Hospital login successful', value={
                    'refresh': 'jwt-refresh-token',
                    'access': 'jwt-access-token',
                    'hospital': {
                        'id': 1,
                        'name': 'Sample Hospital',
                        'email': 'hospital@example.com'
                    }
                }, response_only=True)]
            ),
            401: OpenApiResponse(description='Invalid credentials')
        }
    )
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        
        if not email or not password:
            return Response(
                {'error': 'Email and password are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Authenticate user
        user = authenticate(email=email, password=password)
        if user is None:
            return Response(
                {'error': 'Invalid credentials'}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # Check if user is linked to a hospital
        try:
            hospital = user.hospital
        except HealthCenter.DoesNotExist:
            return Response(
                {'error': 'This account is not linked to any hospital'}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # Generate tokens
        refresh = RefreshToken.for_user(user)
        access = str(refresh.access_token)
        
        return Response({
            'refresh': str(refresh),
            'access': access,
            'hospital': {
                'id': hospital.id,
                'name': hospital.name,
                'email': hospital.email
            }
        }, status=status.HTTP_200_OK)

class HospitalProfileView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    @extend_schema(
        responses={
            200: OpenApiResponse(
                response=OpenApiTypes.OBJECT,
                description='Hospital profile details',
                examples=[OpenApiExample('Hospital profile', value={
                    'id': 1,
                    'name': 'Sample Hospital',
                    'description': 'A great hospital',
                    'address': '123 Main St',
                    'city': 'Kampala',
                    'country': 'Uganda',
                    'email': 'hospital@example.com',
                    'phone': '+256700000000',
                    'is_emergency': True,
                    'has_ambulance': False,
                    'has_pharmacy': True,
                    'has_lab': False,
                    'specialties': 'Cardiology, Neurology',
                    'conditions_treated': 'Malaria, Typhoid, Diabetes'
                }, response_only=True)]
            ),
            404: OpenApiResponse(description='Hospital not found')
        }
    )
    def get(self, request):
        # DEBUG: Print Authorization header and user info
        print('DEBUG: Authorization header:', request.META.get('HTTP_AUTHORIZATION'))
        print('DEBUG: User:', request.user)
        print('DEBUG: User is authenticated:', request.user.is_authenticated)
        try:
            hospital = request.user.hospital
            serializer = HealthCenterSerializer(hospital)
            return Response(serializer.data)
        except HealthCenter.DoesNotExist:
            return Response(
                {'error': 'No hospital found for this user'}, 
                status=status.HTTP_404_NOT_FOUND
            )

    @extend_schema(
        request=OpenApiTypes.OBJECT,
        responses={
            200: OpenApiResponse(
                response=OpenApiTypes.OBJECT,
                description='Hospital profile updated successfully',
                examples=[OpenApiExample('Profile updated', value={
                    'message': 'Hospital profile updated successfully',
                    'hospital': {
                        'id': 1,
                        'name': 'Updated Hospital',
                        'email': 'updated@hospital.com'
                    }
                }, response_only=True)]
            ),
            400: OpenApiResponse(description='Validation error'),
            404: OpenApiResponse(description='Hospital not found')
        }
    )
    def put(self, request):
        """Update hospital profile details for the authenticated user"""
        try:
            hospital = request.user.hospital
            
            # Update hospital fields
            update_fields = [
                'name', 'description', 'address', 'city', 'country', 
                'email', 'phone', 'is_emergency', 'has_ambulance', 
                'has_pharmacy', 'has_lab', 'specialties', 'conditions_treated'
            ]
            
            for field in update_fields:
                if field in request.data:
                    setattr(hospital, field, request.data[field])
            
            hospital.save()
            
            serializer = HealthCenterSerializer(hospital)
            return Response({
                'message': 'Hospital profile updated successfully',
                'hospital': serializer.data
            })
            
        except HealthCenter.DoesNotExist:
            return Response(
                {'error': 'No hospital found for this user'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error updating hospital profile: {str(e)}", exc_info=True)
            return Response(
                {'error': 'Failed to update hospital profile'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )