import logging
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Social

logger = logging.getLogger(__name__)

@api_view(['GET'])
def get_social_links(request):
    try:
        social_links = Social.objects.filter(is_active=True)
        
        social_list = []
        for social in social_links:
            social_list.append({
                'id': social.id,
                'social_name': social.social_name, 
                'social_url': social.social_url
            })

        return Response({
            'message': 'Socials retrieved successfully.',
            'socials': social_list
        }, status=status.HTTP_200_OK)

    except Exception:
        logger.exception('Unexpected error while fetching social channels')
        return Response(
            {'message': 'Could not retrieve social links.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )