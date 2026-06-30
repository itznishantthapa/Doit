from django.contrib.auth.models import AbstractBaseUser
from django.db import models
from django.contrib.auth.base_user import BaseUserManager

# ==========================================
# 1. CUSTOM USER MANAGER
# ==========================================
class UserManager(BaseUserManager):
    """
    Custom manager to handle user and superuser creation 
    using the customized strict fields.
    """
    def create_user(self, username, password=None, **extra_fields):
        if not username:
            raise ValueError("The Username field must be set")
        
        extra_fields.setdefault("role", "user")
        extra_fields.setdefault("is_suspended", False)
        extra_fields.setdefault("is_active", True)
        
        user = self.model(username=username, **extra_fields)
        user.set_password(password)  # Securely hashes the password
        user.save(using=self._db)
        return user

    def create_superuser(self, username, password=None, **extra_fields):
        extra_fields.setdefault("role", "admin")
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        return self.create_user(username, password, **extra_fields)


# ==========================================
# 2. CUSTOM USER MODEL
# ==========================================
class User(AbstractBaseUser):
    """
    Strictly isolated User model containing only your targeted fields,
    optimized with database indexing and admin panel support flags.
    """
    ROLE_CHOICES = (
        ('user', 'User'),
        ('admin', 'Admin'),
    )

    # Core identification & credentials
    username = models.CharField(max_length=150, unique=True)
    
    # Contextual data fields
    country = models.CharField(max_length=100, blank=True, null=True)
    program = models.CharField(max_length=100, blank=True, null=True)
    
    # Client tracking hardware specs
    device_id = models.CharField(max_length=255, blank=True, null=True)
    platform = models.CharField(max_length=50, blank=True, null=True) # e.g., Android, iOS, Web
    notification_token = models.TextField(blank=True, null=True)
    
    # Authorization & Status flags
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='user')
    is_suspended = models.BooleanField(default=False)
    
    # Two-factor authentication (admin TOTP)
    totp_secret = models.CharField(max_length=64, blank=True, null=True)
    totp_enabled = models.BooleanField(default=False)
    failed_totp_attempts = models.PositiveSmallIntegerField(default=0)
    totp_frozen_until = models.DateTimeField(blank=True, null=True)

    # System timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Minimal core architecture flags required for Django operational fallback & Admin UI
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)

    # Assign custom management logic
    objects = UserManager()

    # Tells Django to treat 'username' as the unique login credential identifier
    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = []

    class Meta:
        db_table = 'users'  # Enforces clean, non-prefixed table name in DB
        indexes = [
            # High-performance index for hardware lookups and sessions
            models.Index(fields=['device_id'], name='users_device_idx'),
            # High-performance composite index for authentication routing
            models.Index(fields=['username', 'is_suspended'], name='users_lookup_idx'),
        ]

    def __str__(self):
        return f"{self.username} ({self.role})"

    # Fallback legacy authentication check routines (Mapped directly to your explicit roles)
    def has_perm(self, perm, obj=None):
        return self.role == 'admin'

    def has_module_perms(self, app_label):
        return self.role == 'admin'