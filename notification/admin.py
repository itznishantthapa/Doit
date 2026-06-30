from django.contrib import admin

from .models import SystemNotification, UserNotification


@admin.register(UserNotification)
class UserNotificationAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "user",
        "screen_name",
        "is_read",
        "created_at",
    )
    list_display_links = ("title",)
    list_filter = (
        "is_read",
        "screen_name",
        ("created_at", admin.DateFieldListFilter),
    )
    search_fields = ("title", "description", "user__username")
    raw_id_fields = ("user",)
    readonly_fields = ("created_at",)
    fieldsets = (
        ("Notification", {"fields": ("user", "title", "description", "is_read")}),
        ("Navigation", {"fields": ("screen_name", "assignment_id")}),
        ("Timestamps", {"fields": ("created_at",)}),
    )


@admin.register(SystemNotification)
class SystemNotificationAdmin(admin.ModelAdmin):
    list_display = ("title", "topic", "created_at")
    list_display_links = ("title",)
    list_filter = ("topic", ("created_at", admin.DateFieldListFilter))
    search_fields = ("title", "message", "topic")
    readonly_fields = ("created_at",)
    fieldsets = (
        ("Notification", {"fields": ("title", "message", "topic")}),
        ("Timestamps", {"fields": ("created_at",)}),
    )
