from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.db import models
from cloudinary.models import CloudinaryField

class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255, blank=True, null=True)
    email = models.EmailField(unique=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    def __str__(self):
        return self.email

class HealthCenter(models.Model):
    # Existing fields
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    description = models.TextField()
    address = models.CharField(max_length=255)
    city = models.CharField(max_length=255)
    country = models.CharField(max_length=255, default='Uganda')
    email = models.EmailField(blank=True, null=True)
    phone = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        help_text='Phone number format: +256 XXX XXXXXX (e.g., +256 752 234567)'
    )
    image = CloudinaryField('image', blank=True, null=True)
    
    # New fields for medical services
    is_emergency = models.BooleanField(default=True, help_text='24/7 emergency services available')
    has_ambulance = models.BooleanField(default=False)
    has_pharmacy = models.BooleanField(default=True)
    has_lab = models.BooleanField(default=False)
    
    # Medical specialties (comma-separated values)
    specialties = models.TextField(blank=True, null=True, help_text='Comma-separated list of medical specialties')
    
    # Common conditions treated (comma-separated values)
    conditions_treated = models.TextField(blank=True, null=True, help_text='Comma-separated list of conditions treated')
    
    # Timestamps
    createdAt = models.DateTimeField(auto_now_add=True)
    updatedAt = models.DateTimeField(auto_now=True)
    
    def get_specialties_list(self):
        return [s.strip() for s in self.specialties.split(',')] if self.specialties else []
    
    def get_conditions_list(self):
        return [c.strip() for c in self.conditions_treated.split(',')] if self.conditions_treated else []

    def __str__(self):
        return self.name

    class Meta:
        unique_together = ('address', 'name')
        ordering = ['name']

class Notification(models.Model):
    NOTIFICATION_TYPES = [
        ('new_center', 'New Health Center Nearby'),
        ('facility_update', 'Facility Update'),
        ('system', 'System Announcement'),
        ('account', 'Account Activity'),
        ('emergency', 'Emergency Alert'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=255)
    message = models.TextField()
    notification_type = models.CharField(max_length=50, choices=NOTIFICATION_TYPES)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    data = models.JSONField(null=True, blank=True)  # Store additional context data

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.user.email}"