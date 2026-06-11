from django.db import models


class Social(models.Model):
    SOCIAL_CHOICES = (
        ('facebook', 'Facebook'),
        ('instagram', 'Instagram'),
        ('whatsapp', 'Whatsapp'),
        ('viber', 'Viber'),
        ('telegram', 'Telegram'),
        ('tiktok', 'Tiktok'),
    )
    social_name = models.CharField(max_length=255,choices=SOCIAL_CHOICES)
    social_url = models.URLField(blank=True, null=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.social_name}"