import logging

from django.db import transaction
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, parser_classes, permission_classes
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from assignment.models import Assignment
from assignmentprogress.models import AssignmentProgress
from .models import AssignmentPayment

logger = logging.getLogger(__name__)

MAX_PAYMENT_ATTEMPTS = 3


def mark_payment_doing(progress, screenshot_path=None):
    progress.payment_status = 'doing'
    progress.payment_receipt_date = timezone.now()
    if screenshot_path:
        progress.payment_screenshot = screenshot_path
    progress.save()


@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
@permission_classes([IsAuthenticated])
def submit_payment(request):
    try:
        operation_type = request.data.get('operation_type')
        assignment_id = request.data.get('assignment_id')
        payment_ss = request.FILES.get('payment_screenshot')

        if operation_type not in ('post', 'update') or not assignment_id:
            return Response(
                {'message': "operation_type & assignment_id are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            assignment = Assignment.objects.get(id=assignment_id, user=request.user)
        except Assignment.DoesNotExist:
            return Response(
                {'message': 'Assignment not found or unauthorized access.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        with transaction.atomic():
            progress, _ = AssignmentProgress.objects.get_or_create(assignment=assignment)
            pay_amount = progress.price or 0

            if progress.payment_attempt_count >= MAX_PAYMENT_ATTEMPTS:
                return Response(
                    {'message': 'Reached limit'},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            if operation_type == 'post':
                if not payment_ss:
                    return Response(
                        {'message': 'Payment screenshot is required.'},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                payment = AssignmentPayment.objects.create(
                    assignment=assignment,
                    user=request.user,
                    payment_ss=payment_ss,
                    pay_amount=pay_amount,
                )
                mark_payment_doing(progress, payment.payment_ss.name)
                message = 'Payment submitted successfully.'

            else:
                payment = AssignmentPayment.objects.filter(
                    assignment=assignment,
                    user=request.user,
                ).first()

                if not payment:
                    return Response(
                        {'message': 'No prior payment record found.'},
                        status=status.HTTP_404_NOT_FOUND,
                    )

                if payment_ss:
                    payment.payment_ss = payment_ss
                    payment.pay_amount = pay_amount
                    payment.pay_at = timezone.now()
                    payment.save()
                    mark_payment_doing(progress, payment.payment_ss.name)
                else:
                    mark_payment_doing(progress)

                message = 'Payment updated successfully.'

            progress.payment_attempt_count += 1
            progress.save(update_fields=['payment_attempt_count'])

        return Response({'message': message}, status=status.HTTP_200_OK)

    except Exception:
        logger.exception('Unexpected error during payment submission')
        return Response(
            {'message': 'Could not complete payment.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )
