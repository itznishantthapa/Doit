import logging

from axes.handlers.proxy import AxesProxyHandler
from django.contrib.auth import authenticate
from django.core import signing
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken

from admin.totp_utils import (
    AUTH_FAILURE_MESSAGE,
    create_setup_token,
    create_verify_token,
    generate_totp_secret,
    get_admin_for_totp,
    get_provisioning_uri,
    is_totp_frozen,
    load_token,
    record_totp_failure,
    reset_totp_failures,
    verify_totp_code,
)
from admin.utils import is_admin
from user.models import User
from user.utils import get_tokens_for_user, get_user_data as build_user_payload

logger = logging.getLogger(__name__)


class AuthRateThrottle(AnonRateThrottle):
    scope = 'auth'


def _auth_failure_response():
    return Response(
        {'message': AUTH_FAILURE_MESSAGE},
        status=status.HTTP_400_BAD_REQUEST,
    )


def _validate_admin_user(user):
    if user.role != 'admin' or user.is_suspended or not user.is_active:
        return _auth_failure_response()

    return None


def _complete_login_response(user, message='Login successful.'):
    return Response({
        'message': message,
        'step': 'complete',
        'tokens': get_tokens_for_user(user),
        'user': build_user_payload(user),
    }, status=status.HTTP_200_OK)


def _handle_invalid_totp(user):
    record_totp_failure(user)
    return _auth_failure_response()


@api_view(['POST'])
@throttle_classes([AuthRateThrottle])
def admin_login(request):
    try:
        username = request.data.get('username')
        password = request.data.get('password')

        if not username or not password:
            return Response(
                {'message': 'Username and password are required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        credentials = {'username': username}
        if AxesProxyHandler.is_locked(request, credentials):
            return _auth_failure_response()

        user_lookup = User.objects.filter(username=username).first()
        if user_lookup and is_totp_frozen(user_lookup):
            return _auth_failure_response()

        user = authenticate(request=request, username=username, password=password)
        if not user:
            return _auth_failure_response()

        admin_error = _validate_admin_user(user)
        if admin_error:
            return admin_error

        if is_totp_frozen(user):
            return _auth_failure_response()

        if not user.totp_enabled:
            payload = {
                'message': (
                    'Enter the verification code from your authenticator app.'
                    if user.totp_secret
                    else 'Scan the QR code with your authenticator app, then enter the verification code.'
                ),
                'step': 'totp_setup',
                'setup_token': create_setup_token(user.id),
            }

            if not user.totp_secret:
                user.totp_secret = generate_totp_secret()
                user.save(update_fields=['totp_secret'])
                payload['otpauth_uri'] = get_provisioning_uri(user, user.totp_secret)

            return Response(payload, status=status.HTTP_200_OK)

        return Response({
            'message': 'Enter the code from your authenticator app.',
            'step': 'totp_verify',
            'verify_token': create_verify_token(user.id),
        }, status=status.HTTP_200_OK)
    except Exception:
        logger.exception('Unexpected error during admin login')
        return Response(
            {'message': 'Could not log in.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(['POST'])
@throttle_classes([AuthRateThrottle])
def admin_totp_setup(request):
    try:
        setup_token = request.data.get('setup_token')
        code = request.data.get('code')

        if not setup_token or not code:
            return Response(
                {'message': 'Setup token and verification code are required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            user_id = load_token(setup_token, 'setup')
        except signing.BadSignature:
            return _auth_failure_response()

        user = get_admin_for_totp(user_id)
        if not user or not user.totp_secret:
            return _auth_failure_response()

        admin_error = _validate_admin_user(user)
        if admin_error:
            return admin_error

        if is_totp_frozen(user):
            return _auth_failure_response()

        if not verify_totp_code(user.totp_secret, code):
            return _handle_invalid_totp(user)

        user.totp_enabled = True
        user.save(update_fields=['totp_enabled'])
        reset_totp_failures(user)

        return _complete_login_response(
            user,
            message='Two-factor authentication enabled. Login successful.',
        )
    except Exception:
        logger.exception('Unexpected error during admin TOTP setup')
        return Response(
            {'message': 'Could not verify authenticator code.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(['POST'])
@throttle_classes([AuthRateThrottle])
def admin_totp_verify(request):
    try:
        verify_token = request.data.get('verify_token')
        code = request.data.get('code')

        if not verify_token or not code:
            return Response(
                {'message': 'Verification token and code are required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            user_id = load_token(verify_token, 'verify')
        except signing.BadSignature:
            return _auth_failure_response()

        user = get_admin_for_totp(user_id)
        if not user or not user.totp_enabled or not user.totp_secret:
            return _auth_failure_response()

        admin_error = _validate_admin_user(user)
        if admin_error:
            return admin_error

        if is_totp_frozen(user):
            return _auth_failure_response()

        if not verify_totp_code(user.totp_secret, code):
            return _handle_invalid_totp(user)

        reset_totp_failures(user)
        return _complete_login_response(user)
    except Exception:
        logger.exception('Unexpected error during admin TOTP verification')
        return Response(
            {'message': 'Could not verify authenticator code.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_admin_user(request):
    try:
        if not is_admin(request.user):
            return Response(
                {'message': 'Admin access required.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        return Response({
            'message': 'Admin user retrieved successfully.',
            'user': build_user_payload(request.user),
        }, status=status.HTTP_200_OK)
    except Exception:
        logger.exception('Unexpected error during admin user retrieval')
        return Response(
            {'message': 'Could not retrieve admin user.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(['POST'])
@throttle_classes([AuthRateThrottle])
def admin_refresh_token(request):
    try:
        refresh = request.data.get('refresh')
        if not refresh:
            return Response(
                {'message': 'Refresh token required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        token = RefreshToken(refresh)
        user_id = token.get('user_id')

        user = User.objects.filter(id=user_id).first()
        if not user or user.role != 'admin':
            return Response(
                {'message': 'Admin access required.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        return Response({
            'message': 'Token refreshed successfully.',
            'access': str(token.access_token),
        }, status=status.HTTP_200_OK)
    except TokenError as exc:
        error_message = str(exc).lower()
        is_expired = 'expired' in error_message

        if is_expired:
            return Response({
                'message': 'Your session has expired. Please log in again.',
                'refresh_expired': True,
            }, status=status.HTTP_401_UNAUTHORIZED)

        return Response({
            'message': 'Invalid session token.',
            'refresh_expired': False,
        }, status=status.HTTP_401_UNAUTHORIZED)
    except Exception:
        logger.exception('Unexpected error during admin token refresh')
        return Response(
            {'message': 'Could not process token refresh.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def admin_logout(request):
    try:
        if not is_admin(request.user):
            return Response(
                {'message': 'Admin access required.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        return Response(
            {'message': 'Logged out successfully.'},
            status=status.HTTP_200_OK,
        )
    except Exception:
        logger.exception('Unexpected error during admin logout')
        return Response(
            {'message': 'Could not log out.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )
