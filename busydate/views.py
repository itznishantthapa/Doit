import logging
from django.utils import timezone  # Timezone-aware utility for accurate "today" lookups
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import BusyDate

logger = logging.getLogger(__name__)

@api_view(['GET'])
def get_busy_dates(request):
    try:
        # Get the current local date based on your server's timezone configuration
        today = timezone.now().date()

        # Fetch busy dates greater than or equal to (gte) today, ordered chronologically
        busy_dates_queryset = BusyDate.objects.filter(date__gte=today)
        
        # Flatten the database objects into a clean array of string dates
        busy_dates_list = []
        for item in busy_dates_queryset:
            # item.date is a Python datetime.date object; format it to 'YYYY-MM-DD'
            busy_dates_list.append(item.date.strftime('%Y-%m-%d'))

        return Response({
            'message': 'Busy dates retrieved successfully.',
            'busy_dates': busy_dates_list
        }, status=status.HTTP_200_OK)

    except Exception:
        logger.exception('Unexpected error while fetching busy dates')
        return Response(
            {'message': 'Could not retrieve busy dates.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )