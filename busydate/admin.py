from django.contrib import admin
from unfold.admin import ModelAdmin
from unfold.contrib.filters.admin import ChoicesDropdownFilter, RangeDateFilter

from .models import BusyDate


@admin.register(BusyDate)
class BusyDateAdmin(ModelAdmin):
    list_display = ("date", "reason", "created_at")
    list_display_links = ("date",)
    list_filter = (
        ("reason", ChoicesDropdownFilter),
        ("date", RangeDateFilter),
    )
    list_filter_submit = True
    search_fields = ("reason",)
    readonly_fields = ("created_at",)
    fieldsets = (
        ("Busy Date", {"fields": ("date", "reason")}),
        ("Timestamps", {"fields": ("created_at",)}),
    )
