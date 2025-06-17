from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate, logout
from .models import User, HealthCenter
from .serializers import UserSerializer, HealthCenterSerializer
from django.db.models import Q
import logging
import cloudinary.uploader

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
        
        # Serialize and return the results
        serializer = HealthCenterSerializer(hospitals, many=True)
        return Response(serializer.data)

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
        
        return Response(available_districts, status=status.HTTP_200_OK)

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