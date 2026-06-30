from django.db import models
from django.conf import settings

class UserNotification(models.Model):
    # Core relationship (Determines who receives the notification)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='notifications'
    )
    
    # Text notification payloads
    title = models.CharField(max_length=255)
    description = models.TextField()
    
    # Navigation parameters for your React Native routing engine
    screen_name = models.CharField(max_length=100, default='Progress')
    
    # Stored as a raw integer matching your assignment primary key type
    assignment_id = models.IntegerField(blank=True, null=True)
    
    # Status metrics
    is_read = models.BooleanField(default=False)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'user_notifications'
        ordering = ['-created_at']

    def __str__(self):
        return f"Notification for User ID {self.user_id}: {self.title}"


class SystemNotification(models.Model):
    title = models.CharField(max_length=255)
    message = models.TextField()
    topic = models.CharField(max_length=100, default='all_users')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'system_notifications'
        ordering = ['-created_at']

    def __str__(self):
        return f"System notification: {self.title}"