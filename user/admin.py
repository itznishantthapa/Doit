from django.contrib import admin

from .models import User


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = (
        "username",
        "role",
        "country",
        "is_active",
        "is_suspended",
        "created_at",
    )
    list_display_links = ("username",)
    list_filter = ("role", "is_active", "is_suspended")
    search_fields = ("username", "device_id", "country", "program")
    readonly_fields = ("created_at", "updated_at", "last_login")
    fieldsets = (
        (None, {"fields": ("username", "password")}),
        ("Profile", {"fields": ("country", "program", "role")}),
        ("Device", {"fields": ("device_id", "platform", "notification_token")}),
        ("Status", {"fields": ("is_active", "is_suspended", "is_staff", "is_superuser")}),
        ("Timestamps", {"fields": ("created_at", "updated_at", "last_login")}),
    )
