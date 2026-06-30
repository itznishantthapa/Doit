from django.contrib import admin

from .models import Social


@admin.register(Social)
class SocialAdmin(admin.ModelAdmin):
    list_display = ("social_name", "social_url", "is_active")
    list_display_links = ("social_name",)
    list_filter = ("social_name", "is_active")
    search_fields = ("social_name", "social_url")
    fieldsets = (
        ("Social Link", {"fields": ("social_name", "social_url", "is_active")}),
    )
