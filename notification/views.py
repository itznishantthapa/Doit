import logging

from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import UserNotification

logger = logging.getLogger(__name__)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_user_notifications(request):

    try:
        # Fixed pagination constraints as requested
        offset = 0
        limit = 10

        # Query the database for the current logged-in user's notification bank
        # The model's Meta class already handles ordering by '-created_at' automatically
        notifications_queryset = UserNotification.objects.filter(
            user=request.user
        )[offset : offset + limit]

        # Transform the records to output only your explicitly required layout fields
        notifications_list = []
        for notification in notifications_queryset:
            notifications_list.append({
                'id': notification.id,
                'title': notification.title,
                'description': notification.description,
                'screen_name': notification.screen_name,
                'assignment_id': notification.assignment_id, # Returns as a clean number/null
                'is_read': notification.is_read,
                # Returns a clean formatted string for the frontend UI (e.g., "12 Jun 2026 23:15")
                'created_at': timezone.localtime(notification.created_at).strftime('%d %b %Y %H:%M')
                    if notification.created_at else None,
            })

        return Response({
            "message": "Notifications retrieved successfully.",
            "notifications": notifications_list
        }, status=status.HTTP_200_OK)

    except Exception:
        logger.exception("Unexpected system error while retrieving user notifications")
        return Response(
            {"message": "Could not retrieve notifications at this time."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )




@api_view(["POST"])
@permission_classes([IsAuthenticated])
def save_notification_token(request):
    """
    Save or update the Firebase Cloud Messaging (FCM) registration token
    for the authenticated user device session.
    """
    try:
        # 1. Extract token parameter matching your frontend object key: { token: fcmToken }
        token = request.data.get("token")
        
        # 2. Upfront Validation Check
        if not token:
            return Response(
                {"message": "Notification token is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 3. Reference the logged-in user instance and update the field
        user = request.user
        user.notification_token = token
        user.save(update_fields=['notification_token'])  # Highly optimized database update execution

        return Response({
            "message": "Notification token saved successfully."
        }, status=status.HTTP_200_OK)

    except Exception:
        logger.exception("Unexpected system failure while saving user notification token")
        return Response(
            {"message": "Could not update registration token at this time."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
