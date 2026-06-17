from django.contrib import admin
from unfold.admin import ModelAdmin
from unfold.contrib.filters.admin import ChoicesDropdownFilter, RangeDateFilter

from .models import UserNotification


@admin.register(UserNotification)
class UserNotificationAdmin(ModelAdmin):
    list_display = (
        "title",
        "user",
        "screen_name",
        "is_read",
        "created_at",
    )
    list_display_links = ("title",)
    list_filter = (
        ("is_read", ChoicesDropdownFilter),
        ("screen_name", ChoicesDropdownFilter),
        ("created_at", RangeDateFilter),
    )
    list_filter_submit = True
    search_fields = ("title", "description", "user__username")
    raw_id_fields = ("user",)
    readonly_fields = ("created_at",)
    fieldsets = (
        ("Notification", {"fields": ("user", "title", "description", "is_read")}),
        ("Navigation", {"fields": ("screen_name", "assignment_id")}),
        ("Timestamps", {"fields": ("created_at",)}),
    )
