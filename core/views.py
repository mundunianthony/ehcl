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

logger = logging.getLogger(__name__)

# Authentication views
class LoginView(APIView):
    permission_classes = [AllowAny]

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

    def post(self, request):
        """Mark notifications as read or handle _method=DELETE"""
        # Check if this is a DELETE request disguised as POST
        if request.data.get('_method') == 'DELETE':
            notification_id = request.path.split('/')[-2]  # Get ID from URL
            if notification_id.isdigit():
                return self.delete(request, int(notification_id))
            else:
                return Response({'error': 'Invalid notification ID'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Original POST logic for marking notifications as read
        notification_ids = request.data.get('notification_ids', [])
        
        if not notification_ids:
            return Response(
                {'error': 'No notification IDs provided'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Try to get user from authentication first
        user = request.user if request.user.is_authenticated else None
        
        # If no authenticated user, try to get user by email from request data
        if not user:
            user_email = request.data.get('user_email')
            if user_email:
                try:
                    user = User.objects.get(email=user_email)
                except User.DoesNotExist:
                    return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
            else:
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

    def delete(self, request, notification_id=None):
        """Delete a specific notification"""
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

        try:
            # Get the notification and verify it belongs to the user
            notification = Notification.objects.get(id=notification_id, user=user)
            notification.delete()
            logger.info(f"Notification {notification_id} deleted for user {user.email}")
            return Response({'message': 'Notification deleted successfully'}, status=status.HTTP_204_NO_CONTENT)
        except Notification.DoesNotExist:
            logger.warn(f"Notification {notification_id} not found for user {getattr(user, 'email', 'unknown')}")
            return Response({'error': 'Notification not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Error deleting notification {notification_id} for user {getattr(user, 'email', 'unknown')}: {str(e)}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class CreateNotificationView(APIView):
    """Create a simple notification"""
    permission_classes = [AllowAny]  # Allow anyone to create notifications
    
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

class AvailableDistrictsView(APIView):
    permission_classes = [AllowAny]

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