import logging

from rest_framework_simplejwt.tokens import RefreshToken

logger = logging.getLogger(__name__)


def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


def get_user_data(user):
    return {
        'id': user.id,
        'username': user.username,
        'role': user.role,
        'country': user.country,
        'program': user.program,
        'device_id': user.device_id,
        'platform': user.platform,
        'is_notification_subscribed': True if user.notification_token else False,
        'is_suspended': user.is_suspended,
        'created_at': user.created_at.isoformat() if user.created_at else None,
    }
