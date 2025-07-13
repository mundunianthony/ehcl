from rest_framework import serializers
from .models import User, HealthCenter, Notification, Appointment

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True, 
        required=True, 
        style={'input_type': 'password'},
        min_length=8,
        error_messages={
            'min_length': 'Password must be at least 8 characters long.',
            'blank': 'Password cannot be empty.'
        }
    )
    
    class Meta:
        model = User
        fields = ['id', 'name', 'email', 'password', 'is_active', 'is_staff']
        extra_kwargs = {
            'email': {
                'required': True,
                'allow_blank': False,
                'error_messages': {
                    'required': 'Email is required.',
                    'blank': 'Email cannot be empty.'
                }
            },
            'name': {'required': False, 'allow_blank': True},
            'password': {'write_only': True},
            'is_active': {'read_only': True},
            'is_staff': {'read_only': True},
        }

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('A user with this email already exists.')
        return value

    def create(self, validated_data):
        # Set a default name if not provided
        if 'name' not in validated_data or not validated_data['name']:
            validated_data['name'] = validated_data['email'].split('@')[0]
        
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            name=validated_data.get('name', '')
        )
        return user

class HealthCenterSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = HealthCenter
        fields = '__all__'

    def get_image_url(self, obj):
        if obj.image:
            return obj.image.url
        return None

    def to_representation(self, instance):
        data = super().to_representation(instance)
        # Remove the original image field and use image_url instead
        if 'image' in data:
            del data['image']
        return data

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'title', 'message', 'notification_type', 'is_read', 'created_at', 'data']
        read_only_fields = ['created_at']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        # Format created_at to ISO format
        data['created_at'] = instance.created_at.isoformat()
        return data

class AppointmentSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_phone = serializers.CharField(source='phone', read_only=True)
    hospital_name = serializers.CharField(source='hospital.name', read_only=True)

    class Meta:
        model = Appointment
        fields = [
            'id', 'user', 'user_email', 'user_phone', 'hospital', 'hospital_name', 'phone', 'date', 'message', 'status', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'user_email', 'user_phone', 'hospital_name']