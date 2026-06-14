from django.urls import path

from . import views

urlpatterns = [
    path('get-user-notifications/', views.get_user_notifications, name='get_user_notifications'),
    path('save-notification-token/', views.save_notification_token, name='save_notification_token'),
]
