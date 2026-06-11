import logging

from django.contrib.auth import authenticate
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import User
from .utils import get_tokens_for_user, get_user_data

logger = logging.getLogger(__name__)


@api_view(['POST'])
def create(request):
    try:
        username = request.data.get('username')
        password = request.data.get('password')
        confirm_password = request.data.get('confirmPassword')
        device_id = request.data.get('deviceId')
        platform = request.data.get('platform')

        if not username or not password or not confirm_password:
            return Response(
                {'message': 'Username, password, are required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if password != confirm_password:
            return Response(
                {'message': 'Passwords do not match.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if User.objects.filter(username=username).exists():
            return Response(
                {'message': 'Username is already taken.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = User.objects.create_user(
            username=username,
            password=password,
            device_id=device_id,
            platform=platform,
        )

        return Response({
            'message': 'Account created successfully',
            'tokens': get_tokens_for_user(user),
            'user': get_user_data(user),
        }, status=status.HTTP_201_CREATED)
    except Exception:
        logger.exception('Unexpected error during account creation')
        return Response(
            {'message': 'Could not create account.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(['POST'])
def login(request):
    try:
        username = request.data.get('username')
        password = request.data.get('password')

        if not username or not password:
            return Response(
                {'message': 'Username and password are required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = authenticate(request=request, username=username, password=password)
        if not user:
            return Response(
                {'message': 'Invalid username or password'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if user.is_suspended:
            return Response(
                {'message': 'Your account has been suspended.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        if not user.is_active:
            return Response(
                {'message': 'Your account is inactive.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        return Response({
            'message': 'Login successful',
            'tokens': get_tokens_for_user(user),
            'user': get_user_data(user),
        }, status=status.HTTP_200_OK)
    except Exception:
        logger.exception('Unexpected error during login')
        return Response(
            {'message': 'Could not log in.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )
