import logging

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from admin.utils import is_admin
from assignment.models import Assignment

logger = logging.getLogger(__name__)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_badge_number(request):
    try:
        if not is_admin(request.user):
            return Response(
                {'message': 'Admin access required.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        pending_assignments = Assignment.objects.filter(
            status='pending',
            is_working=False,
        ).count()
        working_assignments = Assignment.objects.filter(is_working=True).count()

        return Response({
            'message': 'Badge numbers retrieved successfully.',
            'pendingAssignments': pending_assignments,
            'workingAssignments': working_assignments,
        }, status=status.HTTP_200_OK)
    except Exception:
        logger.exception('Unexpected error during admin badge number retrieval')
        return Response(
            {'message': 'Could not retrieve badge numbers.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )
