from django.contrib import admin
from unfold.admin import ModelAdmin

from .models import Banner


@admin.register(Banner)
class BannerAdmin(ModelAdmin):
    list_display = ("id", "url", "image")
    list_display_links = ("id",)
    search_fields = ("url",)
    fieldsets = (
        ("Banner", {"fields": ("image", "url")}),
    )
