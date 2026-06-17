from django.contrib import admin
from unfold.admin import ModelAdmin, TabularInline
from unfold.contrib.filters.admin import ChoicesDropdownFilter, RangeDateFilter

from .models import Assignment, AssignmentFile


class AssignmentFileInline(TabularInline):
    model = AssignmentFile
    extra = 0
    fields = ("file_name", "file_type", "file", "uploaded_at")
    readonly_fields = ("uploaded_at",)


@admin.register(Assignment)
class AssignmentAdmin(ModelAdmin):
    list_display = (
        "name",
        "user",
        "assignment_type",
        "status",
        "is_paid",
        "delivery_date",
        "provided_at",
    )
    list_display_links = ("name",)
    list_filter = (
        ("status", ChoicesDropdownFilter),
        ("assignment_type", ChoicesDropdownFilter),
        ("work_type", ChoicesDropdownFilter),
        ("is_paid", ChoicesDropdownFilter),
        ("delivery_date", RangeDateFilter),
        ("provided_at", RangeDateFilter),
    )
    list_filter_submit = True
    search_fields = ("name", "user__username", "description")
    raw_id_fields = ("user",)
    readonly_fields = ("provided_at", "updated_at")
    inlines = (AssignmentFileInline,)
    fieldsets = (
        ("Assignment", {"fields": ("user", "name", "description")}),
        (
            "Classification",
            {"fields": ("assignment_type", "work_type", "delivery_date")},
        ),
        ("Status", {"fields": ("status", "is_paid", "completed_file")}),
        (
            "Change Requests",
            {
                "fields": (
                    "changes_request_description",
                    "changes_request_count",
                    "changes_request_resolved_count",
                ),
            },
        ),
        ("Timestamps", {"fields": ("provided_at", "updated_at")}),
    )


@admin.register(AssignmentFile)
class AssignmentFileAdmin(ModelAdmin):
    list_display = ("file_name", "assignment", "file_type", "uploaded_at")
    list_display_links = ("file_name",)
    list_filter = (("file_type", ChoicesDropdownFilter), ("uploaded_at", RangeDateFilter))
    list_filter_submit = True
    search_fields = ("file_name", "assignment__name")
    raw_id_fields = ("assignment",)
    readonly_fields = ("uploaded_at",)
    fieldsets = (
        ("File", {"fields": ("assignment", "file_name", "file_type", "file")}),
        ("Timestamps", {"fields": ("uploaded_at",)}),
    )
