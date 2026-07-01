import logging

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from admin.utils import is_admin
from assignment.models import Assignment
from user.models import User

logger = logging.getLogger(__name__)

IN_REVIEW_STATUSES = ('in_review', 'payment_pending', 'unsubmitted')
NON_ADMIN_ROLE = 'user'


def _get_non_admin_users_queryset():
    return User.objects.filter(role=NON_ADMIN_ROLE).order_by('-created_at')


def _serialize_admin_user(user):
    return {
        'id': str(user.id),
        'username': user.username,
        'role': user.get_role_display(),
        'country': user.country or '',
        'isActive': user.is_active,
        'isSuspended': user.is_suspended,
        'createdAt': user.created_at.strftime('%Y-%m-%d') if user.created_at else None,
    }


def _serialize_user_stats(assignments_queryset):
    return {
        'totalGiven': str(assignments_queryset.count()),
        'totalInReview': str(
            assignments_queryset.filter(
                status__in=IN_REVIEW_STATUSES,
            ).count()
        ),
        'totalDoing': str(
            assignments_queryset.filter(status='doing').count()
        ),
        'totalCompleted': str(
            assignments_queryset.filter(status='completed').count()
        ),
        'totalRejected': str(
            assignments_queryset.filter(status='rejected').count()
        ),
    }


def _serialize_user_details(user):
    assignments_queryset = user.assignments.all()
    return {
        'id': str(user.id),
        'username': user.username,
        'createdAt': user.created_at.strftime('%Y-%m-%d') if user.created_at else None,
        'user_stats': _serialize_user_stats(assignments_queryset),
    }


def _serialize_user_assignment(assignment):
    return {
        'id': str(assignment.id),
        'name': assignment.name,
        'assignmentType': assignment.get_assignment_type_display(),
        'status': assignment.status,
        'isPaid': assignment.is_paid,
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


def _get_user_or_404(user_id):
    try:
        return User.objects.get(id=user_id)
    except (User.DoesNotExist, ValueError, TypeError):
        return None


def _parse_pagination_params(request):
    try:
        offset = int(request.GET.get('offset', 0))
        limit = int(request.GET.get('limit', 5))
    except ValueError:
        return None, None, Response(
            {'message': 'Invalid offset or limit values provided.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if offset < 0 or limit <= 0:
        return None, None, Response(
            {'message': 'Offset and limit parameters must be positive numbers.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    return offset, limit, None


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def search_users(request):
    try:
        if not is_admin(request.user):
            return Response(
                {'message': 'Admin access required.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        username = request.GET.get('username', '').strip()
        if not username:
            return Response(
                {'message': 'username is required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        matching_users = _get_non_admin_users_queryset().filter(
            username__icontains=username
        )
        total_count = matching_users.count()
        users_list = [_serialize_admin_user(user) for user in matching_users]

        return Response({
            'message': 'Users search completed successfully.',
            'users': users_list,
            'total_count': total_count,
        }, status=status.HTTP_200_OK)
    except Exception:
        logger.exception('Unexpected error during admin users search')
        return Response(
            {'message': 'Could not search users.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_users_data(request):
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

        base_queryset = _get_non_admin_users_queryset()
        total_count = base_queryset.count()
        users_chunk = base_queryset[offset:offset + limit]

        has_more = offset + limit < total_count
        next_offset = (offset + limit) if has_more else None

        users_list = [_serialize_admin_user(user) for user in users_chunk]

        return Response({
            'message': 'Users retrieved successfully.',
            'users': users_list,
            'total_count': total_count,
            'next_offset': next_offset,
            'has_more': has_more,
        }, status=status.HTTP_200_OK)
    except Exception:
        logger.exception('Unexpected error during admin users data retrieval')
        return Response(
            {'message': 'Could not retrieve users.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_user_password(request):
    try:
        if not is_admin(request.user):
            return Response(
                {'message': 'Admin access required.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        user_id = request.data.get('user_id')
        password = request.data.get('password')
        confirm_password = request.data.get('confirm_password')

        if not user_id or not password or not confirm_password:
            return Response(
                {'message': 'user_id, password, and confirm_password are required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if password != confirm_password:
            return Response(
                {'message': 'Passwords do not match.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if len(password) < 6:
            return Response(
                {'message': 'Password must be at least 6 characters.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            user = _get_non_admin_users_queryset().get(id=user_id)
        except (User.DoesNotExist, ValueError, TypeError):
            return Response(
                {'message': 'User not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        user.set_password(password)
        user.save(update_fields=['password'])

        return Response(
            {'message': f'Password updated successfully for {user.username}.'},
            status=status.HTTP_200_OK,
        )
    except Exception:
        logger.exception('Unexpected error during admin user password update')
        return Response(
            {'message': 'Could not update user password.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def delete_user(request):
    try:
        if not is_admin(request.user):
            return Response(
                {'message': 'Admin access required.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        user_id = request.data.get('user_id')
        if not user_id:
            return Response(
                {'message': 'user_id is required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            user = User.objects.get(id=user_id)
        except (User.DoesNotExist, ValueError, TypeError):
            return Response(
                {'message': 'User not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        if user.id == request.user.id:
            return Response(
                {'message': 'You cannot delete your own account.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        username = user.username
        user.delete()

        return Response(
            {'message': f'User {username} deleted successfully.'},
            status=status.HTTP_200_OK,
        )
    except Exception:
        logger.exception('Unexpected error during admin user deletion')
        return Response(
            {'message': 'Could not delete user.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_details(request, user_id):
    try:
        if not is_admin(request.user):
            return Response(
                {'message': 'Admin access required.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        user = _get_user_or_404(user_id)
        if user is None:
            return Response(
                {'message': 'User not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response({
            'message': 'User details fetched successfully.',
            'user': _serialize_user_details(user),
        }, status=status.HTTP_200_OK)
    except Exception:
        logger.exception('Unexpected error during admin user details retrieval')
        return Response(
            {'message': 'Could not retrieve user details.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_assignments_data(request, user_id):
    try:
        if not is_admin(request.user):
            return Response(
                {'message': 'Admin access required.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        user = _get_user_or_404(user_id)
        if user is None:
            return Response(
                {'message': 'User not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        offset, limit, pagination_error = _parse_pagination_params(request)
        if pagination_error is not None:
            return pagination_error

        base_queryset = user.assignments.order_by('-provided_at')
        total_count = base_queryset.count()
        assignments_chunk = base_queryset[offset:offset + limit]

        has_more = offset + limit < total_count
        next_offset = (offset + limit) if has_more else None

        assignments_list = [
            _serialize_user_assignment(assignment)
            for assignment in assignments_chunk
        ]

        return Response({
            'message': 'User assignments retrieved successfully.',
            'assignments': assignments_list,
            'total_count': total_count,
            'next_offset': next_offset,
            'has_more': has_more,
        }, status=status.HTTP_200_OK)
    except Exception:
        logger.exception('Unexpected error during admin user assignments retrieval')
        return Response(
            {'message': 'Could not retrieve user assignments.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )
