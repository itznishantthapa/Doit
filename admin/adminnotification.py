import logging

from django.db import transaction
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from admin.utils import is_admin
from core.firebase import DEFAULT_FCM_TOPIC, send_topic_notification
from notification.models import SystemNotification

logger = logging.getLogger(__name__)

MAX_PAGE_LIMIT = 5


def _parse_pagination_params(request):
    try:
        offset = int(request.GET.get('offset', 0))
        limit = int(request.GET.get('limit', MAX_PAGE_LIMIT))
    except ValueError:
        return None, None, Response(
            {'message': 'Invalid offset or limit values provided.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if offset < 0 or limit <= 0 or limit > MAX_PAGE_LIMIT:
        return None, None, Response(
            {'message': f'Offset must be >= 0 and limit must be between 1 and {MAX_PAGE_LIMIT}.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    return offset, limit, None


def _serialize_system_notification(notification):
    return {
        'id': str(notification.id),
        'title': notification.title,
        'message': notification.message,
        'topic': notification.topic,
        'createdAt': notification.created_at.strftime('%d %b %Y %H:%M'),
    }


def _get_notification_or_404(notification_id):
    try:
        return SystemNotification.objects.get(id=notification_id)
    except (SystemNotification.DoesNotExist, ValueError, TypeError):
        return None


def _send_system_notification_to_topic(title, message, topic):
    try:
        send_topic_notification(title=title, body=message, topic=topic)
    except RuntimeError:
        return Response(
            {'message': 'Firebase is not configured.'},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )
    except Exception:
        logger.exception('Failed to send system notification to FCM topic %s', topic)
        return Response(
            {'message': 'Could not send notification to users.'},
            status=status.HTTP_502_BAD_GATEWAY,
        )

    return None


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_system_notifications(request):
    try:
        if not is_admin(request.user):
            return Response(
                {'message': 'Admin access required.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        offset, limit, pagination_error = _parse_pagination_params(request)
        if pagination_error is not None:
            return pagination_error

        base_queryset = SystemNotification.objects.all().order_by('-created_at')
        total_count = base_queryset.count()
        notifications_chunk = base_queryset[offset:offset + limit]

        has_more = offset + limit < total_count
        next_offset = (offset + limit) if has_more else None

        notifications_list = [
            _serialize_system_notification(notification)
            for notification in notifications_chunk
        ]

        return Response({
            'message': 'System notifications retrieved successfully.',
            'notifications': notifications_list,
            'total_count': total_count,
            'next_offset': next_offset,
            'has_more': has_more,
        }, status=status.HTTP_200_OK)
    except Exception:
        logger.exception('Unexpected error during admin system notifications retrieval')
        return Response(
            {'message': 'Could not retrieve system notifications.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_system_notification(request):
    try:
        if not is_admin(request.user):
            return Response(
                {'message': 'Admin access required.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        title = (request.data.get('title') or '').strip()
        message = (request.data.get('message') or '').strip()
        topic = (request.data.get('topic') or DEFAULT_FCM_TOPIC).strip()

        if not title or not message:
            return Response(
                {'message': 'title and message are required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        send_error = _send_system_notification_to_topic(title, message, topic)
        if send_error is not None:
            return send_error

        with transaction.atomic():
            notification = SystemNotification.objects.create(
                title=title,
                message=message,
                topic=topic,
            )

        return Response({
            'message': 'System notification sent and saved successfully.',
            'notification': _serialize_system_notification(notification),
        }, status=status.HTTP_201_CREATED)
    except Exception:
        logger.exception('Unexpected error during admin system notification creation')
        return Response(
            {'message': 'Could not create system notification.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def resend_system_notification(request):
    try:
        if not is_admin(request.user):
            return Response(
                {'message': 'Admin access required.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        notification_id = request.data.get('notification_id')
        if not notification_id:
            return Response(
                {'message': 'notification_id is required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        notification = _get_notification_or_404(notification_id)
        if notification is None:
            return Response(
                {'message': 'Notification not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        send_error = _send_system_notification_to_topic(
            notification.title,
            notification.message,
            notification.topic,
        )
        if send_error is not None:
            return send_error

        return Response({
            'message': 'System notification resent successfully.',
            'notification': _serialize_system_notification(notification),
        }, status=status.HTTP_200_OK)
    except Exception:
        logger.exception('Unexpected error during admin system notification resend')
        return Response(
            {'message': 'Could not resend system notification.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )
