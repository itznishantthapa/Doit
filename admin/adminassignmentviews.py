import logging

from django.db.models import F
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from admin.utils import is_admin
from assignment.models import Assignment

logger = logging.getLogger(__name__)

VALID_STATUSES = {choice[0] for choice in Assignment.STATUS_CHOICES}
VALID_TAB_STATUSES = VALID_STATUSES | {'all', 'changes'}


def _serialize_admin_assignment(assignment):
    return {
        'id': str(assignment.id),
        'name': assignment.name,
        'user': assignment.user.username,
        'assignmentType': assignment.get_assignment_type_display(),
        'status': assignment.status,
        'isPaid': assignment.is_paid,
        'isWorking': assignment.is_working,
        'providedDate': (
            assignment.provided_at.strftime('%Y-%m-%d')
            if assignment.provided_at
            else None
        ),
        'deliveryDate': (
            assignment.delivery_date.strftime('%Y-%m-%d')
            if assignment.delivery_date
            else None
        ),
    }


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_assignments_data(request):
    try:
        if not is_admin(request.user):
            return Response(
                {'message': 'Admin access required.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        status_filter = request.GET.get('status', 'in_review')
        if status_filter == 'pending':
            status_filter = 'in_review'

        if status_filter not in VALID_TAB_STATUSES:
            return Response(
                {'message': 'Invalid status value provided.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            offset = int(request.GET.get('offset', 0))
            limit = int(request.GET.get('limit', 8))
        except ValueError:
            return Response(
                {'message': 'Invalid offset or limit values provided.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if offset < 0 or limit <= 0:
            return Response(
                {'message': 'Offset and limit parameters must be positive numbers.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if status_filter == 'changes':
            base_queryset = (
                Assignment.objects.select_related('user')
                .annotate(
                    pending_changes=F('changes_request_count')
                    - F('changes_request_resolved_count'),
                )
                .filter(pending_changes__gt=0, is_working=False)
                .order_by('-provided_at')
            )
        else:
            base_queryset = (
                Assignment.objects.select_related('user')
                .filter(is_working=False)
                .order_by('-provided_at')
            )
            if status_filter != 'all':
                base_queryset = base_queryset.filter(status=status_filter)
        total_count = base_queryset.count()
        assignments_chunk = base_queryset[offset:offset + limit]

        has_more = offset + limit < total_count
        next_offset = (offset + limit) if has_more else None

        assignments_list = [
            _serialize_admin_assignment(assignment)
            for assignment in assignments_chunk
        ]

        return Response({
            'message': 'Assignments retrieved successfully.',
            'assignments': assignments_list,
            'total_count': total_count,
            'next_offset': next_offset,
            'has_more': has_more,
        }, status=status.HTTP_200_OK)
    except Exception:
        logger.exception('Unexpected error during admin assignments data retrieval')
        return Response(
            {'message': 'Could not retrieve assignments.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def delete_assignment(request):
    try:
        if not is_admin(request.user):
            return Response(
                {'message': 'Admin access required.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        assignment_id = request.data.get('assignment_id')
        if not assignment_id:
            return Response(
                {'message': 'assignment_id is required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            assignment = Assignment.objects.get(id=assignment_id)
        except (Assignment.DoesNotExist, ValueError, TypeError):
            return Response(
                {'message': 'Assignment not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        assignment_name = assignment.name
        assignment.delete()

        return Response(
            {'message': f'Assignment {assignment_name} deleted successfully.'},
            status=status.HTTP_200_OK,
        )
    except Exception:
        logger.exception('Unexpected error during admin assignment deletion')
        return Response(
            {'message': 'Could not delete assignment.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_assignment_on_working(request):
    try:
        if not is_admin(request.user):
            return Response(
                {'message': 'Admin access required.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        assignment_id = request.data.get('assignment_id')
        if not assignment_id:
            return Response(
                {'message': 'assignment_id is required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            assignment = Assignment.objects.get(id=assignment_id)
        except (Assignment.DoesNotExist, ValueError, TypeError):
            return Response(
                {'message': 'Assignment not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        if assignment.is_working:
            return Response(
                {'message': 'Assignment is already in working.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        assignment.is_working = True
        assignment.added_by = request.user
        assignment.save(update_fields=['is_working', 'added_by'])

        return Response(
            {
                'message': f'Assignment {assignment.name} added to working successfully.',
            },
            status=status.HTTP_200_OK,
        )
    except Exception:
        logger.exception('Unexpected error during admin add assignment on working')
        return Response(
            {'message': 'Could not add assignment to working.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )
