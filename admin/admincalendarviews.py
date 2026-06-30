import logging
from collections import defaultdict
from datetime import datetime

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from admin.utils import is_admin
from assignment.models import Assignment
from busydate.models import BusyDate

logger = logging.getLogger(__name__)


def _parse_date_strings(date_strings):
    parsed_dates = []

    for date_string in date_strings:
        try:
            parsed_dates.append(datetime.strptime(date_string, '%Y-%m-%d').date())
        except (TypeError, ValueError):
            continue

    return parsed_dates


def _serialize_busy_dates():
    return [
        busy_date.date.strftime('%Y-%m-%d')
        for busy_date in BusyDate.objects.all().order_by('date')
    ]


def _build_calendar_date_meta():
    delivery_by_date = defaultdict(list)
    delivered_by_date = defaultdict(list)

    delivery_assignments = Assignment.objects.filter(
        delivery_date__isnull=False,
        delivered_date__isnull=True,
    ).values('id', 'name', 'delivery_date')

    for assignment in delivery_assignments:
        date_key = assignment['delivery_date'].strftime('%Y-%m-%d')
        delivery_by_date[date_key].append({
            'id': assignment['id'],
            'metaAssignmentName': assignment['name'],
        })

    delivered_assignments = Assignment.objects.filter(
        delivered_date__isnull=False,
    ).values('id', 'name', 'delivered_date')

    for assignment in delivered_assignments:
        date_key = assignment['delivered_date'].strftime('%Y-%m-%d')
        delivered_by_date[date_key].append({
            'id': assignment['id'],
            'metaAssignmentName': assignment['name'],
        })

    all_dates = set(delivery_by_date.keys()) | set(delivered_by_date.keys())
    calendar_date_meta = []

    for date_key in sorted(all_dates):
        delivery_items = delivery_by_date[date_key]
        delivered_items = delivered_by_date[date_key]

        calendar_date_meta.append({
            'date': date_key,
            'isDelivery': bool(delivery_items),
            'isDelivered': bool(delivered_items),
            'deliveryAssignments': delivery_items,
            'deliveredAssignments': delivered_items,
        })

    return calendar_date_meta


def _calendar_payload():
    return {
        'bookedDates': _serialize_busy_dates(),
        'calendarDateMeta': _build_calendar_date_meta(),
    }


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_calendar_data(request):
    try:
        if not is_admin(request.user):
            return Response(
                {'message': 'Admin access required.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        return Response({
            'message': 'Calendar data retrieved successfully.',
            **_calendar_payload(),
        }, status=status.HTTP_200_OK)
    except Exception:
        logger.exception('Unexpected error during admin calendar data retrieval')
        return Response(
            {'message': 'Could not retrieve calendar data.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_busy_dates(request):
    try:
        if not is_admin(request.user):
            return Response(
                {'message': 'Admin access required.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        dates = request.data.get('dates')
        if not isinstance(dates, list) or not dates:
            return Response(
                {'message': 'A non-empty dates array is required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        parsed_dates = _parse_date_strings(dates)
        if not parsed_dates:
            return Response(
                {'message': 'No valid dates provided. Use YYYY-MM-DD format.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        reason = request.data.get('reason', 'heavy_assignments')
        if reason not in dict(BusyDate.REASON_CHOICES):
            reason = 'heavy_assignments'

        for date_value in parsed_dates:
            BusyDate.objects.update_or_create(
                date=date_value,
                defaults={'reason': reason},
            )

        return Response({
            'message': 'Busy dates marked successfully.',
            **_calendar_payload(),
        }, status=status.HTTP_200_OK)
    except Exception:
        logger.exception('Unexpected error while marking busy dates')
        return Response(
            {'message': 'Could not mark busy dates.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_available_dates(request):
    try:
        if not is_admin(request.user):
            return Response(
                {'message': 'Admin access required.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        dates = request.data.get('dates')
        if not isinstance(dates, list) or not dates:
            return Response(
                {'message': 'A non-empty dates array is required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        parsed_dates = _parse_date_strings(dates)
        if not parsed_dates:
            return Response(
                {'message': 'No valid dates provided. Use YYYY-MM-DD format.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        deleted_count, _ = BusyDate.objects.filter(date__in=parsed_dates).delete()

        return Response({
            'message': 'Busy dates removed successfully.',
            'removedCount': deleted_count,
            **_calendar_payload(),
        }, status=status.HTTP_200_OK)
    except Exception:
        logger.exception('Unexpected error while marking dates available')
        return Response(
            {'message': 'Could not mark dates as available.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )
