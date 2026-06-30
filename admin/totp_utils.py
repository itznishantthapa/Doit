from datetime import timedelta

import pyotp
from django.core import signing
from django.utils import timezone

from user.models import User

SETUP_SALT = 'admin-totp-setup-v1'
VERIFY_SALT = 'admin-totp-verify-v1'
TOKEN_MAX_AGE = 900
TOTP_FREEZE_MINUTES = 30
TOTP_FAILURE_LIMIT = 5
TOTP_ISSUER = 'Doit Admin'


def generate_totp_secret():
    return pyotp.random_base32()


def get_provisioning_uri(user, secret):
    totp = pyotp.TOTP(secret)
    return totp.provisioning_uri(name=user.username, issuer_name=TOTP_ISSUER)


def verify_totp_code(secret, code):
    totp = pyotp.TOTP(secret)
    return totp.verify(str(code).strip(), valid_window=1)


def create_setup_token(user_id):
    return signing.dumps({'uid': user_id, 'purpose': 'setup'}, salt=SETUP_SALT)


def create_verify_token(user_id):
    return signing.dumps({'uid': user_id, 'purpose': 'verify'}, salt=VERIFY_SALT)


def load_token(token, expected_purpose):
    salt = SETUP_SALT if expected_purpose == 'setup' else VERIFY_SALT
    data = signing.loads(token, salt=salt, max_age=TOKEN_MAX_AGE)
    if data.get('purpose') != expected_purpose:
        raise signing.BadSignature('Invalid token purpose.')
    return data['uid']


def is_totp_frozen(user):
    return bool(user.totp_frozen_until and user.totp_frozen_until > timezone.now())


AUTH_FAILURE_MESSAGE = "We're unable to authenticate."


def record_totp_failure(user):
    user.failed_totp_attempts += 1
    if user.failed_totp_attempts >= TOTP_FAILURE_LIMIT:
        user.totp_frozen_until = timezone.now() + timedelta(minutes=TOTP_FREEZE_MINUTES)
    user.save(update_fields=['failed_totp_attempts', 'totp_frozen_until'])


def reset_totp_failures(user):
    user.failed_totp_attempts = 0
    user.totp_frozen_until = None
    user.save(update_fields=['failed_totp_attempts', 'totp_frozen_until'])


def get_admin_for_totp(user_id):
    return User.objects.filter(id=user_id, role='admin', is_active=True).first()
