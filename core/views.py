from django.conf import settings
from django.http import HttpResponse
from django.shortcuts import render
from firebase_admin import messaging
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny

from core.firebase import is_firebase_configured


def privacy(request):
    return render(request, 'privacy.html')


def terms(request):
    return render(request, 'terms.html')


def support(request):
    return render(request, 'support.html', {
        'support_email': 'itsnishantu@gmail.com',
    })


@api_view(["GET"])
@permission_classes([AllowAny])
def test_topic_broadcast(request):
    """
    Browser-triggerable GET endpoint to send a preset notification to a
    Firebase topic (default: all_users). Enabled only when
    FIREBASE_ENABLE_TEST_BROADCAST is true.
    """
    if not settings.FIREBASE_ENABLE_TEST_BROADCAST:
        return HttpResponse(
            "<h3>Test broadcast disabled</h3>"
            "<p>Set <code>FIREBASE_ENABLE_TEST_BROADCAST=True</code> in your .env to enable.</p>",
            status=404,
        )

    if not is_firebase_configured():
        return HttpResponse(
            "<h3>Firebase not configured</h3>"
            "<p>Add the <code>FIREBASE_*</code> variables to your <code>.env</code> file.</p>",
            status=503,
        )

    title = "Doit Apps"
    body = (
        "We're talking from the firebase topic system."
    )
    banner_url = settings.FIREBASE_TEST_BANNER_URL
    topic_name = settings.FIREBASE_TEST_TOPIC

    try:
        notification_payload = messaging.Notification(
            title=title,
            body=body,
            image=banner_url,
        )

        message = messaging.Message(
            notification=notification_payload,
            topic=topic_name,
            data={
                "title": title,
                "body": body,
                "banner_url": banner_url,
            },
            apns=messaging.APNSConfig(
                payload=messaging.APNSPayload(aps=messaging.Aps(mutable_content=True)),
                fcm_options=messaging.APNSFCMOptions(image=banner_url),
            ),
            android=messaging.AndroidConfig(
                notification=messaging.AndroidNotification(image=banner_url),
            ),
        )

        response = messaging.send(message)

        return HttpResponse(
            f"<h3>Success! Mass broadcast triggered.</h3>"
            f"<p><b>Firebase Message ID:</b> {response}</p>"
            f"<p><b>Target Topic:</b> {topic_name}</p>"
            f"<p>Check your test phone device screen now!</p>"
        )

    except Exception as exc:
        return HttpResponse(
            f"<h3>Firebase Delivery Failed</h3><p><b>Error:</b> {exc}</p>",
            status=500,
        )
