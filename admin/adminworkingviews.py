import logging

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from admin.utils import is_admin
from assignment.models import Assignment

logger = logging.getLogger(__name__)


def _serialize_working_assignment(assignment):
    return {
        'id': str(assignment.id),
        'name': assignment.name,
        'user': assignment.user.username,
        'assignmentType': assignment.get_assignment_type_display(),
        'status': assignment.status,
        'isPaid': assignment.is_paid,
        'addedBy': assignment.added_by.username if assignment.added_by else '',
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
def get_working_assignments_data(request):
    try:
        if not is_admin(request.user):
            return Response(
                {'message': 'Admin access required.'},
                status=status.HTTP_403_FORBIDDEN,
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

        base_queryset = (
            Assignment.objects.select_related('user', 'added_by')
            .filter(is_working=True)
            .order_by('-provided_at')
        )
        total_count = base_queryset.count()
        assignments_chunk = base_queryset[offset:offset + limit]

        has_more = offset + limit < total_count
        next_offset = (offset + limit) if has_more else None

        assignments_list = [
            _serialize_working_assignment(assignment)
            for assignment in assignments_chunk
        ]

        return Response({
            'message': 'Working assignments retrieved successfully.',
            'assignments': assignments_list,
            'total_count': total_count,
            'next_offset': next_offset,
            'has_more': has_more,
        }, status=status.HTTP_200_OK)
    except Exception:
        logger.exception('Unexpected error during admin working assignments data retrieval')
        return Response(
            {'message': 'Could not retrieve working assignments.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def remove_from_working(request):
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

        if not assignment.is_working:
            return Response(
                {'message': 'Assignment is not in working.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        assignment_name = assignment.name
        assignment.is_working = False
        assignment.added_by = None
        assignment.save(update_fields=['is_working', 'added_by'])

        return Response(
            {
                'message': (
                    f'Assignment {assignment_name} removed from working successfully.'
                ),
            },
            status=status.HTTP_200_OK,
        )
    except Exception:
        logger.exception('Unexpected error during admin remove from working')
        return Response(
            {'message': 'Could not remove assignment from working.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )
