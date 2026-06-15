import logging

from django.db import transaction
from django.utils.dateparse import parse_date
from rest_framework import status
from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.response import Response

from assignmentprogress.models import AssignmentProgress
from .models import Assignment, AssignmentFile

logger = logging.getLogger(__name__)

MAX_CHANGES_REQUESTS = 2


def format_delivery_date(value):
    if not value:
        return None
    if hasattr(value, 'strftime'):
        return value.strftime('%Y-%m-%d')
    return str(value)


@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser, JSONParser])
def create_assignment(request):
    try:
        # 1. Extract structural text data parameters
        name = request.data.get('name')
        assignment_type = request.data.get('assignment_type', 'assessment')
        work_type = request.data.get('work_type', 'individual')
        delivery_date = parse_date(request.data.get('delivery_date'))
        description = request.data.get('description')

        # 2. Upfront Validation Checks
        if not name or not delivery_date:
            return Response(
                {'message': 'Assignment name and a valid delivery date (YYYY-MM-DD) are required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        uploaded_files = request.FILES.getlist('files')

        # 3. Database atomic transaction execution tracking block
        with transaction.atomic():
            assignment = Assignment.objects.create(
                user=request.user,
                name=name,
                assignment_type=assignment_type,
                work_type=work_type,
                delivery_date=delivery_date,
                description=description,
                status='in_review'
            )

            # 4. Handle and append files iteratively
            for file_obj in uploaded_files:
                ext = file_obj.name.split('.')[-1].lower()
                if ext in ['jpg', 'jpeg', 'png']:
                    resolved_type = 'image'
                elif ext in ['pdf', 'doc', 'docx']:
                    resolved_type = 'document'
                else:
                    resolved_type = 'other'

                AssignmentFile.objects.create(
                    assignment=assignment,
                    file_name=file_obj.name,
                    file_type=resolved_type,
                    file=file_obj
                )

        # 5. Return payload explicitly containing structured assignment object info
        return Response({
            'message': 'Assignment request submitted successfully.',
            'status': assignment.status
        }, status=status.HTTP_201_CREATED)

    except Exception:
        logger.exception('Unexpected error during assignment submission processing')
        return Response(
            {'message': 'Could not process assignment submission request.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )





@api_view(['GET'])
@parser_classes([JSONParser])
def get_infinite_assignments(request):
    try:
        status_filter = request.GET.get('status', 'all')
        offset = int(request.GET.get('offset', 0))
        limit = int(request.GET.get('limit', 10))

        if status_filter not in ('pending', 'completed', 'all'):
            return Response(
                {'message': 'Invalid status. Use pending, completed, or all.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if offset < 0 or limit <= 0:
            return Response(
                {'message': 'Offset and limit parameters must be positive numbers.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        base_queryset = Assignment.objects.filter(user=request.user).order_by('-provided_at')

        if status_filter == 'pending':
            base_queryset = base_queryset.filter(status__in=Assignment.PENDING_STATUSES)
        elif status_filter == 'completed':
            base_queryset = base_queryset.filter(status=Assignment.COMPLETED_STATUS)

        total_count = base_queryset.count()
        assignments_chunk = base_queryset[offset:offset + limit]

        has_more = offset + limit < total_count
        next_offset = (offset + limit) if has_more else None

        assignments_list = []
        for assignment in assignments_chunk:
            assignments_list.append({
                'id': assignment.id,
                'title': assignment.name,
                'delivery_date': format_delivery_date(assignment.delivery_date),
                'status': assignment.status,
                'assignment_type': assignment.assignment_type,
            })

        return Response({
            'message': 'Assignments retrieved successfully.',
            'assignments': assignments_list,
            'total_count': total_count,
            'next_offset': next_offset,
            'has_more': has_more,
        }, status=status.HTTP_200_OK)

    except ValueError:
        return Response(
            {'message': 'Invalid offset or limit values provided.'},
            status=status.HTTP_400_BAD_REQUEST,
        )
    except Exception:
        logger.exception('Unexpected system failure while fetching paginated infinite assignments list')
        return Response(
            {'message': 'Could not retrieve assignments payload at this time.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(['POST'])
@parser_classes([JSONParser])
def unsubmit_assignment(request):
    try:
        assignment_id = request.data.get('assignment_id')
        if not assignment_id:
            return Response(
                {'message': 'assignment_id is required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            assignment = Assignment.objects.get(id=assignment_id, user=request.user)
        except Assignment.DoesNotExist:
            return Response(
                {'message': 'Assignment not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        if assignment.status == 'in_review':
            assignment.status = 'unsubmitted'
            message = 'Assignment unsubmitted successfully.'
        elif assignment.status == 'unsubmitted':
            assignment.status = 'in_review'
            message = 'Assignment submitted successfully.'
        else:
            return Response(
                {'message': f'You cannot toggle submission, it is already in {assignment.status}.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        assignment.save(update_fields=['status', 'updated_at'])

        return Response({'message': message}, status=status.HTTP_200_OK)

    except Exception:
        logger.exception('Unexpected error during assignment submission toggle')
        return Response(
            {'message': 'Could not update assignment submission status.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(['POST'])
@parser_classes([JSONParser])
def changes_request(request):
    try:
        assignment_id = request.data.get('assignment_id')
        description = request.data.get('changes_request_description')

        if not assignment_id or not description:
            return Response(
                {'message': 'assignment_id and changes_request_description are required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            assignment = Assignment.objects.get(id=assignment_id, user=request.user)
        except Assignment.DoesNotExist:
            return Response(
                {'message': 'Assignment not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        if assignment.changes_request_count >= MAX_CHANGES_REQUESTS:
            return Response(
                {'message': 'Maximum changes request limit reached.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        with transaction.atomic():
            progress, _ = AssignmentProgress.objects.get_or_create(assignment=assignment)

            assignment.changes_request_description = description
            assignment.changes_request_count += 1
            assignment.save(update_fields=[
                'changes_request_description',
                'changes_request_count',
                'updated_at',
            ])

            progress.doing_status = 'pending'
            progress.completed_is_active = False
            progress.completed_status = 'pending'
            progress.save(update_fields=[
                'doing_status',
                'completed_is_active',
                'completed_status',
            ])

        return Response(
            {'message': 'Changes request submitted successfully.'},
            status=status.HTTP_200_OK,
        )

    except Exception:
        logger.exception('Unexpected error during changes request')
        return Response(
            {'message': 'Could not submit changes request.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )