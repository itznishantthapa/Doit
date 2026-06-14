import logging
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from assignment.models import Assignment
from payment.models import PaymentDetails
from .models import AssignmentProgress

logger = logging.getLogger(__name__)



@api_view(['GET'])
def get_assignment_progress(request):

    try:
        # 1. Parse the assignment ID parameter from the GET query payload
        assignment_id = request.GET.get('assignment_id')
        if not assignment_id:
            return Response(
                {'message': 'assignment_id query parameter is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 2. Fetch the target assignment and ensure it belongs to the authenticated user
        try:
            assignment = Assignment.objects.get(id=assignment_id, user=request.user)
        except Assignment.DoesNotExist:
            return Response(
                {'message': 'Assignment not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        # 3. Retrieve or safely initialize the associated progress record
        # (Using get_or_create guarantees the app won't crash if an old record didn't auto-create)
        progress, created = AssignmentProgress.objects.get_or_create(assignment=assignment)

        # 4. Safely construct asset absolute image URLs if they exist
        payment_details_url = None
        if progress.payment_details_image:
            payment_details_url = request.build_absolute_uri(progress.payment_details_image.url)

        # 5. Format the tracking dates into your required display format ('08 Jun 2026')
        def format_step_date(dt_field):
            return dt_field.strftime('%d %b %Y') if dt_field else None

        payment_step = {
            'payment_receipt_date': format_step_date(progress.payment_receipt_date),
            'payment_done_date': format_step_date(progress.payment_done_date),
            'is_active': progress.payment_is_active,
            'status': progress.payment_status,
            'price': f"{int(progress.price)} AUD" if progress.price is not None else None,
            'payment_details_image': payment_details_url,
            'is_max_submit_reached': progress.payment_attempt_count >= 3,
        }

        if progress.payment_is_active and progress.payment_status in ('pending', 'doing'):
            details = PaymentDetails.objects.order_by('-updated_at').first()
            if details:
                payment_step['payment_details'] = {
                    'pay_id': details.pay_id,
                    'pay_name': details.pay_name,
                    'pay_qr': request.build_absolute_uri(details.pay_qr.url) if details.pay_qr else None,
                    'pay_description': details.qr_description,
                }

        response_data = {
            'id': str(assignment.id),
            'title': assignment.name,
            'assignment_type': assignment.assignment_type,
            'delivery_date': assignment.delivery_date.strftime('%Y-%m-%d') if assignment.delivery_date else None,
            'steps': {
                'provided': {
                    'date': format_step_date(progress.provided_date),
                    'is_active': progress.provided_is_active,
                    'status': progress.provided_status,
                },
                'payment': payment_step,
                'doing': {
                    'date': format_step_date(progress.doing_date),
                    'is_active': progress.doing_is_active,
                    'status': progress.doing_status,
                },
                'completed': {
                    'date': format_step_date(progress.completed_date),
                    'is_active': progress.completed_is_active,
                    'status': progress.completed_status,
                }
            }
        }

        return Response({
            'message': 'Assignment progress tracked successfully.',
            'progress': response_data
        }, status=status.HTTP_200_OK)

    except Exception:
        logger.exception('Unexpected system failure while tracking assignment progress pipeline')
        return Response(
            {'message': 'Could not retrieve tracking details.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )