import logging

from django.db import transaction

from core.firebase import initialize_firebase, is_firebase_configured, send_device_notification
from notification.models import UserNotification

logger = logging.getLogger(__name__)

DEFAULT_SCREEN_NAME = 'Progress'


def _format_title(assignment, *, success: bool = True) -> str:
    prefix = '✅' if success else '❌'
    return f'{prefix} {assignment.name}'


def notify_assignment_user(
    assignment,
    *,
    push_title: str,
    push_body: str,
    db_title: str,
    db_description: str,
    screen_name: str = DEFAULT_SCREEN_NAME,
) -> None:
    user = assignment.user

    UserNotification.objects.create(
        user=user,
        title=db_title,
        description=db_description,
        screen_name=screen_name,
        assignment_id=assignment.id,
    )

    token = (user.notification_token or '').strip()
    if not token:
        logger.info('No FCM token for user %s; in-app notification saved only.', user.id)
        return

    if not is_firebase_configured():
        logger.warning('Firebase is not configured; in-app notification saved only.')
        return

    try:
        initialize_firebase()
        send_device_notification(
            token=token,
            title=push_title,
            body=push_body,
            data={
                'title': push_title,
                'body': push_body,
                'assignment_id': str(assignment.id),
                'screen_name': screen_name,
            },
        )
    except Exception:
        logger.exception('Failed to send push notification to user %s', user.id)


def schedule_assignment_notification(notify_fn, assignment) -> None:
    transaction.on_commit(lambda: notify_fn(assignment))


def notify_payment_details_sent(assignment) -> None:
    title = _format_title(assignment)
    notify_assignment_user(
        assignment,
        push_title=title,
        push_body='Review complete. Please make your payment to ensure on-time delivery.',
        db_title=title,
        db_description='Helper successfully reviewed your assignment.',
    )


def notify_assignment_completed(assignment) -> None:
    title = _format_title(assignment)
    notify_assignment_user(
        assignment,
        push_title=title,
        push_body='Your assignment is complete and ready to download.',
        db_title=title,
        db_description='Click here to download',
    )


def notify_assignment_updated(assignment) -> None:
    title = _format_title(assignment)
    notify_assignment_user(
        assignment,
        push_title=title,
        push_body='Your assignment is updated as per your request.',
        db_title=title,
        db_description='Updated, click here to download',
    )


def notify_payment_approved(assignment) -> None:
    title = _format_title(assignment)
    notify_assignment_user(
        assignment,
        push_title=title,
        push_body="We've received your payment. Work on your assignment has started.",
        db_title=title,
        db_description='Payment successful',
    )


def notify_assignment_provided_rejected(assignment) -> None:
    title = _format_title(assignment, success=False)
    notify_assignment_user(
        assignment,
        push_title=title,
        push_body="We can't proceed due to the deadline or assignment requirements.",
        db_title=title,
        db_description='Assignment rejected',
    )


def notify_payment_rejected(assignment) -> None:
    title = _format_title(assignment, success=False)
    notify_assignment_user(
        assignment,
        push_title=title,
        push_body='We are unable to verify your payment',
        db_title=title,
        db_description='Payment verification failed',
    )
