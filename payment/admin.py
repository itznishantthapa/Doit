from django.contrib import admin
from unfold.admin import ModelAdmin
from unfold.contrib.filters.admin import RangeDateFilter

from .models import AssignmentPayment, PaymentDetails


@admin.register(PaymentDetails)
class PaymentDetailsAdmin(ModelAdmin):
    list_display = ("pay_name", "pay_id", "updated_at")
    list_display_links = ("pay_name", "pay_id")
    search_fields = ("pay_name", "pay_id")
    readonly_fields = ("updated_at",)
    fieldsets = (
        ("Payment Provider", {"fields": ("pay_name", "pay_id")}),
        ("QR Asset", {"fields": ("pay_qr", "qr_description")}),
        ("Timestamps", {"fields": ("updated_at",)}),
    )


@admin.register(AssignmentPayment)
class AssignmentPaymentAdmin(ModelAdmin):
    list_display = (
        "id",
        "assignment",
        "user",
        "pay_amount",
        "pay_at",
    )
    list_display_links = ("id", "assignment")
    list_filter = (("pay_at", RangeDateFilter),)
    list_filter_submit = True
    search_fields = ("user__username", "assignment__name", "id")
    raw_id_fields = ("assignment", "user")
    readonly_fields = ("pay_at",)
    fieldsets = (
        ("Payment", {"fields": ("assignment", "user", "pay_amount", "payment_ss")}),
        ("Timestamps", {"fields": ("pay_at",)}),
    )
