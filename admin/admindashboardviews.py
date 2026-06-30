import logging
from datetime import timedelta
from decimal import Decimal

from django.db.models import Count, F, Q, Sum
from django.db.models.functions import TruncDate
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from admin.utils import is_admin
from assignment.models import Assignment
from assignmentprogress.models import AssignmentProgress
from user.models import User

logger = logging.getLogger(__name__)

PIE_STATUS_GROUPS = (
    ('Pending', ('payment_pending', 'payment_rejected', 'unsubmitted')),
    ('Review', ('in_review',)),
    ('Completed', ('completed',)),
    ('Doing', ('doing',)),
    ('Rejected', ('rejected',)),
)


def _month_start(reference=None):
    reference = reference or timezone.now()
    return reference.replace(day=1, hour=0, minute=0, second=0, microsecond=0)


def _previous_month_start(reference=None):
    current_month_start = _month_start(reference)
    return (current_month_start - timedelta(days=1)).replace(day=1)


def _calculate_growth_percentage(current, previous):
    if previous == 0:
        return 0.0 if current == 0 else 100.0
    return round(((current - previous) / previous) * 100, 1)


def _decimal_to_number(value):
    if value is None:
        return 0
    if isinstance(value, Decimal):
        return float(value)
    return value


def _build_stat_block(current, previous):
    return {
        'total': current,
        'growthPercentage': _calculate_growth_percentage(current, previous),
    }


def _count_users_until(end_datetime):
    return User.objects.filter(role='user', created_at__lt=end_datetime).count()


def _count_assignments_until(end_datetime):
    return Assignment.objects.filter(provided_at__lt=end_datetime).count()


def _count_completed_until(end_datetime):
    return Assignment.objects.filter(
        status=Assignment.COMPLETED_STATUS,
        updated_at__lt=end_datetime,
    ).count()


def _sum_revenue_between(start_datetime, end_datetime):
    revenue = AssignmentProgress.objects.filter(
        assignment__is_paid=True,
        price__isnull=False,
        assignment__updated_at__gte=start_datetime,
        assignment__updated_at__lt=end_datetime,
    ).aggregate(total=Sum('price'))['total']

    return _decimal_to_number(revenue)


def _build_assignment_breakdown():
    status_counts = {
        row['status']: row['count']
        for row in Assignment.objects.values('status').annotate(count=Count('id'))
    }

    total = sum(status_counts.values())
    statuses = []

    for label, db_statuses in PIE_STATUS_GROUPS:
        count = sum(status_counts.get(db_status, 0) for db_status in db_statuses)
        percentage = round((count / total) * 100, 1) if total else 0.0
        statuses.append({
            'status': label,
            'count': count,
            'percentage': percentage,
        })

    now = timezone.now()
    start_of_this_month = _month_start(now)
    start_of_last_month = _previous_month_start(now)

    assignments_this_month = Assignment.objects.filter(
        provided_at__gte=start_of_this_month,
    ).count()
    assignments_last_month = Assignment.objects.filter(
        provided_at__gte=start_of_last_month,
        provided_at__lt=start_of_this_month,
    ).count()

    return {
        'total': total,
        'statuses': statuses,
        'growthPercentage': _calculate_growth_percentage(
            assignments_this_month,
            assignments_last_month,
        ),
        'period': 'Lifetime',
    }


def _build_assignment_completion_series():
    today = timezone.localdate()
    start_date = today - timedelta(days=29)

    completed_rows = (
        Assignment.objects.filter(
            status=Assignment.COMPLETED_STATUS,
            updated_at__date__gte=start_date,
            updated_at__date__lte=today,
        )
        .annotate(day=TruncDate('updated_at'))
        .values('day')
        .annotate(count=Count('id'))
    )
    rejected_rows = (
        Assignment.objects.filter(
            status='rejected',
            updated_at__date__gte=start_date,
            updated_at__date__lte=today,
        )
        .annotate(day=TruncDate('updated_at'))
        .values('day')
        .annotate(count=Count('id'))
    )

    completed_map = {row['day']: row['count'] for row in completed_rows}
    rejected_map = {row['day']: row['count'] for row in rejected_rows}

    series = []
    completed_total = 0
    rejected_total = 0
    current_date = start_date

    while current_date <= today:
        completed_count = completed_map.get(current_date, 0)
        rejected_count = rejected_map.get(current_date, 0)
        completed_total += completed_count
        rejected_total += rejected_count

        series.append({
            'date': current_date.isoformat(),
            'completed': completed_count,
            'rejected': rejected_count,
        })
        current_date += timedelta(days=1)

    return {
        'completed': completed_total,
        'rejected': rejected_total,
        'series': series,
    }


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_dashboard_data(request):
    try:
        if not is_admin(request.user):
            return Response(
                {'message': 'Admin access required.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        now = timezone.now()
        start_of_this_month = _month_start(now)
        start_of_last_month = _previous_month_start(now)

        users_qs = User.objects.filter(role='user')
        total_users = users_qs.count()
        ios_users = users_qs.filter(
            Q(platform__icontains='ios') | Q(platform__iexact='iOS')
        ).count()
        android_users = users_qs.filter(platform__icontains='android').count()

        users_at_last_month_end = _count_users_until(start_of_this_month)

        total_assignments = Assignment.objects.count()
        assignments_at_last_month_end = _count_assignments_until(start_of_this_month)

        total_revenue = _decimal_to_number(
            AssignmentProgress.objects.filter(
                assignment__is_paid=True,
                price__isnull=False,
            ).aggregate(total=Sum('price'))['total']
        )
        revenue_this_month = _sum_revenue_between(start_of_this_month, now)
        revenue_last_month = _sum_revenue_between(start_of_last_month, start_of_this_month)

        total_deliveries = Assignment.objects.filter(
            status=Assignment.COMPLETED_STATUS,
        ).count()
        deliveries_at_last_month_end = _count_completed_until(start_of_this_month)

        total_changes = (
            Assignment.objects.annotate(
                pending_changes=F('changes_request_count')
                - F('changes_request_resolved_count'),
            )
            .filter(pending_changes__gt=0)
            .aggregate(total=Sum('pending_changes'))['total']
        ) or 0
        pending_payments = AssignmentProgress.objects.filter(
            payment_status='doing',
        ).count()

        return Response({
            'message': 'Dashboard data retrieved successfully.',
            'stats': {
                'users': {
                    **_build_stat_block(total_users, users_at_last_month_end),
                    'iosUsers': ios_users,
                    'androidUsers': android_users,
                },
                'assignments': _build_stat_block(
                    total_assignments,
                    assignments_at_last_month_end,
                ),
                'revenue': {
                    'total': total_revenue,
                    'growthPercentage': _calculate_growth_percentage(
                        revenue_this_month,
                        revenue_last_month,
                    ),
                },
                'deliveries': _build_stat_block(
                    total_deliveries,
                    deliveries_at_last_month_end,
                ),
                'changes': {
                    'total': total_changes,
                    'growthPercentage': 0,
                },
                'pendingPayments': {
                    'total': pending_payments,
                    'growthPercentage': 0,
                },
            },
            'assignmentBreakdown': _build_assignment_breakdown(),
            'assignmentCompletion': _build_assignment_completion_series(),
        }, status=status.HTTP_200_OK)
    except Exception:
        logger.exception('Unexpected error during admin dashboard data retrieval')
        return Response(
            {'message': 'Could not retrieve dashboard data.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )
