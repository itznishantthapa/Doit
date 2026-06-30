import logging

import firebase_admin
from django.conf import settings
from firebase_admin import credentials, messaging

logger = logging.getLogger(__name__)

DEFAULT_FCM_TOPIC = 'all_users'


def is_firebase_configured() -> bool:
    return bool(
        settings.FIREBASE_PROJECT_ID
        and settings.FIREBASE_CLIENT_EMAIL
        and settings.FIREBASE_PRIVATE_KEY
    )


def build_firebase_credentials_dict() -> dict:
    private_key = settings.FIREBASE_PRIVATE_KEY.replace("\\n", "\n")
    creds = {
        "type": "service_account",
        "project_id": settings.FIREBASE_PROJECT_ID,
        "private_key_id": settings.FIREBASE_PRIVATE_KEY_ID,
        "private_key": private_key,
        "client_email": settings.FIREBASE_CLIENT_EMAIL,
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
        "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    }
    if settings.FIREBASE_CLIENT_ID:
        creds["client_id"] = settings.FIREBASE_CLIENT_ID
    if settings.FIREBASE_CLIENT_X509_CERT_URL:
        creds["client_x509_cert_url"] = settings.FIREBASE_CLIENT_X509_CERT_URL
    return creds


def initialize_firebase() -> None:
    if firebase_admin._apps:
        return

    if not is_firebase_configured():
        logger.warning(
            "Firebase Admin SDK not initialized: missing FIREBASE_* environment variables."
        )
        return

    cred = credentials.Certificate(build_firebase_credentials_dict())
    firebase_admin.initialize_app(cred)
    logger.info("Firebase Admin SDK initialized for project %s.", settings.FIREBASE_PROJECT_ID)


def send_topic_notification(title: str, body: str, topic: str = DEFAULT_FCM_TOPIC) -> str:
    if not is_firebase_configured():
        raise RuntimeError('Firebase is not configured.')

    message = messaging.Message(
        notification=messaging.Notification(title=title, body=body),
        topic=topic,
        data={
            'title': title,
            'body': body,
        },
    )
    return messaging.send(message)
