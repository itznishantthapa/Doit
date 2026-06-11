import logging
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Banner

logger = logging.getLogger(__name__)

@api_view(['GET'])
def get_banners(request):
    try:
        # Fetch all banners from the database
        banners = Banner.objects.all()
        
        banner_list = []
        for banner in banners:
            # Safely generate the complete image URL if an image exists
            image_url = None
            if banner.image:
                image_url = request.build_absolute_uri(banner.image.url)
                
            banner_list.append({
                'id': banner.id,
                'image': image_url,
                'url': banner.url
            })

        return Response({
            'message': 'Banners retrieved successfully.',
            'banners': banner_list
        }, status=status.HTTP_200_OK)

    except Exception:
        logger.exception('Unexpected error while fetching banners')
        return Response(
            {'message': 'Could not retrieve banners.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )