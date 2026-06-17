from django.contrib import admin
from unfold.admin import ModelAdmin
from unfold.contrib.filters.admin import ChoicesDropdownFilter

from .models import Social


@admin.register(Social)
class SocialAdmin(ModelAdmin):
    list_display = ("social_name", "social_url", "is_active")
    list_display_links = ("social_name",)
    list_filter = (
        ("social_name", ChoicesDropdownFilter),
        ("is_active", ChoicesDropdownFilter),
    )
    list_filter_submit = True
    search_fields = ("social_name", "social_url")
    fieldsets = (
        ("Social Link", {"fields": ("social_name", "social_url", "is_active")}),
    )
