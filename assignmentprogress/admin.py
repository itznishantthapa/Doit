from django.contrib import admin

from .models import AssignmentProgress


@admin.register(AssignmentProgress)
class AssignmentProgressAdmin(admin.ModelAdmin):
    list_display = (
        "assignment",
        "provided_status",
        "payment_status",
        "doing_status",
        "completed_status",
        "price",
    )
    list_display_links = ("assignment",)
    list_filter = (
        "provided_status",
        "payment_status",
        "doing_status",
        "completed_status",
    )
    search_fields = ("assignment__name", "assignment__user__username")
    raw_id_fields = ("assignment",)
    readonly_fields = ("provided_date",)
    fieldsets = (
        ("Assignment", {"fields": ("assignment", "price")}),
        (
            "Step 1 — Provided",
            {
                "fields": (
                    "provided_date",
                    "provided_is_active",
                    "provided_status",
                ),
            },
        ),
        (
            "Step 2 — Payment",
            {
                "fields": (
                    "payment_receipt_date",
                    "payment_done_date",
                    "payment_is_active",
                    "payment_status",
                    "payment_attempt_count",
                    "payment_screenshot",
                    "payment_details_image",
                ),
            },
        ),
        (
            "Step 3 — Doing",
            {
                "fields": (
                    "doing_date",
                    "doing_is_active",
                    "doing_status",
                ),
            },
        ),
        (
            "Step 4 — Completed",
            {
                "fields": (
                    "completed_date",
                    "completed_is_active",
                    "completed_status",
                ),
            },
        ),
    )
