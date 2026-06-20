import logging

from django.contrib.auth import authenticate
from django.db import IntegrityError
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError

from .models import User
from .utils import get_tokens_for_user, get_user_data as build_user_payload

logger = logging.getLogger(__name__)





@api_view(['GET'])
def get_user_data(request):
    try:
        user = request.user
        return Response({
            'message': 'User data retrieved successfully.',
            'user': build_user_payload(user),
        }, status=status.HTTP_200_OK)
    except Exception:
        logger.exception('Unexpected error during user data retrieval')
        return Response(
            {'message': 'Could not retrieve user data.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


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
            'user': build_user_payload(user),
        }, status=status.HTTP_201_CREATED)
    except IntegrityError:
        return Response(
            {'message': 'Username is already taken.'},
            status=status.HTTP_400_BAD_REQUEST,
        )
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
            'user': build_user_payload(user),
        }, status=status.HTTP_200_OK)
    except Exception:
        logger.exception('Unexpected error during login')
        return Response(
            {'message': 'Could not log in.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )



@api_view(["POST"])
def refresh_token(request):
    try:
        refresh = request.data.get("refresh")
        if not refresh:
            return Response(
                {"message": "Refresh token required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Attempt to initialize and validate the token structure and expiration
        token = RefreshToken(refresh)

        return Response({
            "message": "Token refreshed successfully.",
            "access": str(token.access_token)
        }, status=status.HTTP_200_OK)

    except TokenError as e:
        # Check if the internal string exception notes an actual timeout expiration
        error_message = str(e).lower()
        is_expired = "expired" in error_message

        if is_expired:
            return Response({
                "message": "Your session has expired. Please log in again.",
                "refresh_expired": True  # Clean structural flag for your frontend interceptor
            }, status=status.HTTP_401_UNAUTHORIZED)
            
        return Response({
            "message": "Invalid session token.",
            "refresh_expired": False
        }, status=status.HTTP_401_UNAUTHORIZED)

    except Exception:
        logger.exception("Unexpected error during token refreshment processing")
        return Response(
            {"message": "Could not process token refresh."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def user_logout(request):
    try:
        user = request.user
        user.notification_token = None
        user.save(update_fields=['notification_token'])

        return Response(
            {'message': 'Logged out successfully.'},
            status=status.HTTP_200_OK,
        )
    except Exception:
        logger.exception('Unexpected error during logout')
        return Response(
            {'message': 'Could not log out.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def account_deletion(request):
    try:
        request.user.delete()

        return Response(
            {'message': 'Account deleted successfully.'},
            status=status.HTTP_200_OK,
        )
    except Exception:
        logger.exception('Unexpected error during account deletion')
        return Response(
            {'message': 'Could not delete account.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )
