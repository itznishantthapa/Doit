from django.contrib import admin

from .models import BusyDate


@admin.register(BusyDate)
class BusyDateAdmin(admin.ModelAdmin):
    list_display = ("date", "reason", "created_at")
    list_display_links = ("date",)
    list_filter = ("reason", ("date", admin.DateFieldListFilter))
    search_fields = ("reason",)
    readonly_fields = ("created_at",)
    fieldsets = (
        ("Busy Date", {"fields": ("date", "reason")}),
        ("Timestamps", {"fields": ("created_at",)}),
    )
