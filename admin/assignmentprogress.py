import logging
from decimal import Decimal, InvalidOperation

from django.db import transaction
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, parser_classes, permission_classes
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from admin.utils import is_admin
from assignment.models import Assignment
from assignmentprogress.models import AssignmentProgress
from notification.notifyuser import (
    notify_assignment_completed,
    notify_assignment_provided_rejected,
    notify_assignment_updated,
    notify_payment_approved,
    notify_payment_details_sent,
    notify_payment_rejected,
    schedule_assignment_notification,
)
from payment.models import PaymentDetails

logger = logging.getLogger(__name__)


def _format_step_date(request, dt_field):
    if not dt_field:
        return None
    return timezone.localtime(dt_field).strftime('%d %b %Y %H:%M')


def _build_file_url(request, file_field):
    if not file_field:
        return None
    return request.build_absolute_uri(file_field.url)


def _get_assignment_and_progress(assignment_id):
    try:
        assignment = Assignment.objects.select_related('user').prefetch_related(
            'files',
        ).get(id=assignment_id)
    except (Assignment.DoesNotExist, ValueError, TypeError):
        return None, None

    progress, _ = AssignmentProgress.objects.get_or_create(assignment=assignment)
    return assignment, progress


def _serialize_assignment_progress(request, assignment, progress):
    provided_step = {
        'date': _format_step_date(request, progress.provided_date),
        'is_active': progress.provided_is_active,
        'status': progress.provided_status,
        'provided_files': [
            _build_file_url(request, assignment_file.file)
            for assignment_file in assignment.files.all()
            if assignment_file.file
        ],
        'assignment_description': assignment.description or '',
    }

    payment_step = {
        'payment_receipt_date': _format_step_date(
            request, progress.payment_receipt_date
        ),
        'payment_done_date': _format_step_date(request, progress.payment_done_date),
        'is_active': progress.payment_is_active,
        'status': progress.payment_status,
        'price': f"{int(progress.price)} AUD" if progress.price is not None else None,
        'payment_details_image': _build_file_url(
            request, progress.payment_details_image
        ),
        'payment_screenshot': _build_file_url(request, progress.payment_screenshot),
        'is_max_submit_reached': progress.payment_attempt_count >= 3,
    }

    if progress.payment_is_active and progress.payment_status in ('pending', 'doing'):
        details = PaymentDetails.objects.order_by('-updated_at').first()
        if details:
            payment_step['payment_details'] = {
                'pay_id': details.pay_id,
                'pay_name': details.pay_name,
                'pay_qr': _build_file_url(request, details.pay_qr),
                'pay_description': details.qr_description,
            }

    doing_step = {
        'date': _format_step_date(request, progress.doing_date),
        'is_active': progress.doing_is_active,
        'status': progress.doing_status,
    }

    completed_step = {
        'date': _format_step_date(request, progress.completed_date),
        'is_active': progress.completed_is_active,
        'status': progress.completed_status,
    }

    if assignment.completed_file:
        completed_step['completed_file_url'] = _build_file_url(
            request, assignment.completed_file
        )

    completed_step['changes_request_count'] = assignment.changes_request_count
    completed_step['changes_request_description'] = (
        assignment.changes_request_description or None
    )

    return {
        'id': str(assignment.id),
        'user': {
            'id': assignment.user.id,
            'username': assignment.user.username,
        },
        'title': assignment.name,
        'assignment_type': assignment.get_assignment_type_display(),
        'work_type': assignment.get_work_type_display(),
        'status': assignment.status,
        'delivery_date': (
            assignment.delivery_date.strftime('%Y-%m-%d')
            if assignment.delivery_date
            else None
        ),
        'isWorking': assignment.is_working,
        'steps': {
            'provided': provided_step,
            'payment': payment_step,
            'doing': doing_step,
            'completed': completed_step,
        },
    }


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_assignment_progress_data(request, assignment_id):
    try:
        if not is_admin(request.user):
            return Response(
                {'message': 'Admin access required.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        assignment, progress = _get_assignment_and_progress(assignment_id)
        if assignment is None:
            return Response(
                {'message': 'Assignment not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response({
            'message': 'Assignment progress tracked successfully.',
            'progress': _serialize_assignment_progress(
                request, assignment, progress
            ),
        }, status=status.HTTP_200_OK)
    except Exception:
        logger.exception('Unexpected error during admin assignment progress retrieval')
        return Response(
            {'message': 'Could not retrieve assignment progress.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@parser_classes([JSONParser])
def assignment_received_action(request):
    try:
        if not is_admin(request.user):
            return Response(
                {'message': 'Admin access required.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        assignment_id = request.data.get('assignment_id')
        action = request.data.get('action')

        if not assignment_id or action not in ('approve', 'reject'):
            return Response(
                {'message': 'assignment_id and a valid action are required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        assignment, progress = _get_assignment_and_progress(assignment_id)
        if assignment is None:
            return Response(
                {'message': 'Assignment not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        if progress.provided_status != 'pending':
            return Response(
                {'message': 'Assignment received step is not pending review.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        with transaction.atomic():
            if action == 'approve':
                progress.provided_status = 'completed'
                progress.payment_is_active = True
                progress.save(update_fields=['provided_status', 'payment_is_active'])
                message = 'Assignment received approved successfully.'
            else:
                progress.provided_status = 'rejected'
                progress.payment_is_active = False
                assignment.status = 'rejected'
                assignment.save(update_fields=['status', 'updated_at'])
                progress.save(update_fields=['provided_status', 'payment_is_active'])
                schedule_assignment_notification(
                    notify_assignment_provided_rejected,
                    assignment,
                )
                message = 'Assignment received rejected successfully.'

        return Response({'message': message}, status=status.HTTP_200_OK)
    except Exception:
        logger.exception('Unexpected error during assignment received action')
        return Response(
            {'message': 'Could not update assignment received step.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser, JSONParser])
def payment_actions(request):
    try:
        if not is_admin(request.user):
            return Response(
                {'message': 'Admin access required.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        assignment_id = request.data.get('assignment_id')
        action = request.data.get('action')

        if not assignment_id or action not in ('send', 'approve', 'reject'):
            return Response(
                {'message': 'assignment_id and a valid action are required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        assignment, progress = _get_assignment_and_progress(assignment_id)
        if assignment is None:
            return Response(
                {'message': 'Assignment not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        if not progress.payment_is_active:
            return Response(
                {'message': 'Payment step is not active yet.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        with transaction.atomic():
            if action == 'send':
                if progress.provided_status != 'completed':
                    return Response(
                        {'message': 'Assignment must be approved before sending payment details.'},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                if progress.payment_status not in ('pending', 'rejected'):
                    return Response(
                        {'message': 'Payment details cannot be sent at this stage.'},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                raw_price = request.data.get('price')
                payment_details_image = request.FILES.get('payment_details_image')

                if raw_price in (None, ''):
                    return Response(
                        {'message': 'price is required.'},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                if not payment_details_image:
                    return Response(
                        {'message': 'payment_details_image is required.'},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                try:
                    price = Decimal(str(raw_price))
                except (InvalidOperation, TypeError, ValueError):
                    return Response(
                        {'message': 'Invalid price value provided.'},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                if price <= 0:
                    return Response(
                        {'message': 'Price must be greater than zero.'},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                progress.price = price
                progress.payment_details_image = payment_details_image
                progress.payment_status = 'pending'
                progress.payment_screenshot = None
                progress.payment_receipt_date = None
                progress.payment_done_date = None
                progress.save()
                assignment.status = 'payment_pending'
                assignment.save(update_fields=['status', 'updated_at'])
                schedule_assignment_notification(
                    notify_payment_details_sent,
                    assignment,
                )

                return Response(
                    {'message': 'Payment details sent successfully.'},
                    status=status.HTTP_200_OK,
                )

            if progress.payment_status != 'doing':
                return Response(
                    {'message': 'Payment is not ready for review.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            if action == 'approve':
                now = timezone.now()
                progress.payment_status = 'completed'
                progress.payment_done_date = now
                progress.doing_is_active = True
                progress.doing_status = 'pending'
                progress.doing_date = now
                progress.save()
                assignment.is_paid = True
                assignment.status = 'doing'
                assignment.save(update_fields=['is_paid', 'status', 'updated_at'])
                schedule_assignment_notification(notify_payment_approved, assignment)
                message = 'Payment approved successfully.'
            else:
                progress.payment_status = 'rejected'
                progress.save(update_fields=['payment_status'])
                assignment.status = 'rejected'
                assignment.save(update_fields=['status', 'updated_at'])
                schedule_assignment_notification(notify_payment_rejected, assignment)
                message = 'Payment rejected successfully.'

        return Response({'message': message}, status=status.HTTP_200_OK)
    except Exception:
        logger.exception('Unexpected error during payment action')
        return Response(
            {'message': 'Could not update payment step.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@parser_classes([JSONParser])
def doing_action(request):
    try:
        if not is_admin(request.user):
            return Response(
                {'message': 'Admin access required.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        assignment_id = request.data.get('assignment_id')
        action = request.data.get('action')

        if not assignment_id or action not in ('approve', 'reject'):
            return Response(
                {'message': 'assignment_id and a valid action are required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        assignment, progress = _get_assignment_and_progress(assignment_id)
        if assignment is None:
            return Response(
                {'message': 'Assignment not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        if not progress.doing_is_active or progress.doing_status not in (
            'pending',
            'doing',
        ):
            return Response(
                {'message': 'Doing step is not ready for review.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        with transaction.atomic():
            if action == 'approve':
                progress.doing_status = 'completed'
                progress.completed_is_active = True
                progress.save(update_fields=['doing_status', 'completed_is_active'])
                message = 'Doing step completed successfully.'
            else:
                progress.doing_status = 'rejected'
                progress.save(update_fields=['doing_status'])
                assignment.status = 'rejected'
                assignment.save(update_fields=['status', 'updated_at'])
                message = 'Doing step rejected successfully.'

        return Response({'message': message}, status=status.HTTP_200_OK)
    except Exception:
        logger.exception('Unexpected error during doing action')
        return Response(
            {'message': 'Could not update doing step.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser, JSONParser])
def completed_action(request):
    try:
        if not is_admin(request.user):
            return Response(
                {'message': 'Admin access required.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        assignment_id = request.data.get('assignment_id')
        completed_file = request.FILES.get('completed_file')

        if not assignment_id:
            return Response(
                {'message': 'assignment_id is required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not completed_file:
            return Response(
                {'message': 'completed_file is required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        assignment, progress = _get_assignment_and_progress(assignment_id)
        if assignment is None:
            return Response(
                {'message': 'Assignment not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        if not progress.completed_is_active:
            return Response(
                {'message': 'Completed step is not active yet.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        with transaction.atomic():
            is_change_request_update = (
                assignment.changes_request_count
                > assignment.changes_request_resolved_count
            )
            now = timezone.now()
            assignment.completed_file = completed_file
            assignment.status = 'completed'
            assignment_update_fields = ['completed_file', 'status', 'updated_at']
            if is_change_request_update:
                assignment.changes_request_resolved_count += 1
                assignment_update_fields.append('changes_request_resolved_count')
            assignment.save(update_fields=assignment_update_fields)
            progress.completed_status = 'completed'
            progress.completed_date = now
            progress.save(update_fields=['completed_status', 'completed_date'])

            if is_change_request_update:
                schedule_assignment_notification(notify_assignment_updated, assignment)
            else:
                schedule_assignment_notification(notify_assignment_completed, assignment)

        return Response(
            {'message': 'Completed assignment saved successfully.'},
            status=status.HTTP_200_OK,
        )
    except Exception:
        logger.exception('Unexpected error during completed action')
        return Response(
            {'message': 'Could not save completed assignment.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )
