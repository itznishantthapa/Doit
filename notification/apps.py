from django.apps import AppConfig


class NotificationConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "notification"

    def ready(self):
        from core.firebase import initialize_firebase

        initialize_firebase()
