from django.urls import reverse_lazy
from django.utils.translation import gettext_lazy as _


UNFOLD = {
    "SITE_TITLE": _("xDoit Admin"),
    "SITE_HEADER": _("xDoit"),
    "SITE_SUBHEADER": _("Assignment management panel"),
    "SITE_SYMBOL": "school",
    "SITE_URL": "/",
    "SHOW_HISTORY": True,
    "SHOW_VIEW_ON_SITE": False,
    "BORDER_RADIUS": "12px",
    "COLORS": {
        # Soft cool grey base — matches the neutral card tone in the mobile UI
        "base": {
            "50": "oklch(98.5% 0.006 250)",
            "100": "oklch(96.5% 0.008 250)",
            "200": "oklch(93% 0.012 250)",
            "300": "oklch(87% 0.016 250)",
            "400": "oklch(72% 0.022 250)",
            "500": "oklch(58% 0.026 250)",
            "600": "oklch(48% 0.028 250)",
            "700": "oklch(40% 0.030 250)",
            "800": "oklch(32% 0.028 250)",
            "900": "oklch(26% 0.026 250)",
            "950": "oklch(18% 0.022 250)",
        },
        # Lavender accent — matches the "Pay someone" card in the mobile app
        "primary": {
            "50": "oklch(98% 0.015 290)",
            "100": "oklch(95% 0.035 290)",
            "200": "oklch(91% 0.055 290)",
            "300": "oklch(85% 0.095 290)",
            "400": "oklch(74% 0.145 290)",
            "500": "oklch(66% 0.165 290)",
            "600": "oklch(58% 0.175 290)",
            "700": "oklch(50% 0.155 290)",
            "800": "oklch(42% 0.125 290)",
            "900": "oklch(36% 0.100 290)",
            "950": "oklch(28% 0.080 290)",
        },
    },
    "SIDEBAR": {
        "show_search": True,
        "command_search": True,
        "show_all_applications": False,
        "navigation": [
            {
                "title": _("Overview"),
                "separator": True,
                "items": [
                    {
                        "title": _("Dashboard"),
                        "icon": "dashboard",
                        "link": reverse_lazy("admin:index"),
                    },
                ],
            },
            {
                "title": _("Users"),
                "separator": True,
                "collapsible": True,
                "items": [
                    {
                        "title": _("Users"),
                        "icon": "group",
                        "link": reverse_lazy("admin:user_user_changelist"),
                    },
                ],
            },
            {
                "title": _("Assignments"),
                "separator": True,
                "collapsible": True,
                "items": [
                    {
                        "title": _("Assignments"),
                        "icon": "assignment",
                        "link": reverse_lazy("admin:assignment_assignment_changelist"),
                    },
                    {
                        "title": _("Assignment Files"),
                        "icon": "attach_file",
                        "link": reverse_lazy("admin:assignment_assignmentfile_changelist"),
                    },
                    {
                        "title": _("Progress Tracking"),
                        "icon": "timeline",
                        "link": reverse_lazy(
                            "admin:assignmentprogress_assignmentprogress_changelist"
                        ),
                    },
                ],
            },
            {
                "title": _("Payments"),
                "separator": True,
                "collapsible": True,
                "items": [
                    {
                        "title": _("Payment Details"),
                        "icon": "account_balance",
                        "link": reverse_lazy("admin:payment_paymentdetails_changelist"),
                    },
                    {
                        "title": _("Assignment Payments"),
                        "icon": "payments",
                        "link": reverse_lazy("admin:payment_assignmentpayment_changelist"),
                    },
                ],
            },
            {
                "title": _("Content"),
                "separator": True,
                "collapsible": True,
                "items": [
                    {
                        "title": _("Banners"),
                        "icon": "view_carousel",
                        "link": reverse_lazy("admin:banner_banner_changelist"),
                    },
                    {
                        "title": _("Social Links"),
                        "icon": "share",
                        "link": reverse_lazy("admin:social_social_changelist"),
                    },
                    {
                        "title": _("Busy Dates"),
                        "icon": "event_busy",
                        "link": reverse_lazy("admin:busydate_busydate_changelist"),
                    },
                ],
            },
            {
                "title": _("Notifications"),
                "separator": True,
                "collapsible": True,
                "items": [
                    {
                        "title": _("User Notifications"),
                        "icon": "notifications",
                        "link": reverse_lazy("admin:notification_usernotification_changelist"),
                    },
                ],
            },
        ],
    },
}
