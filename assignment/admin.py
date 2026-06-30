from django.contrib import admin

from .models import Assignment, AssignmentFile


class AssignmentFileInline(admin.TabularInline):
    model = AssignmentFile
    extra = 0
    fields = ("file_name", "file_type", "file", "uploaded_at")
    readonly_fields = ("uploaded_at",)


@admin.register(Assignment)
class AssignmentAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "user",
        "assignment_type",
        "status",
        "is_paid",
        "is_working",
        "added_by",
        "delivery_date",
        "delivered_date",
        "provided_at",
    )
    list_display_links = ("name",)
    list_filter = (
        "status",
        "assignment_type",
        "work_type",
        "is_paid",
        "is_working",
        "added_by",
        ("delivery_date", admin.DateFieldListFilter),
        ("delivered_date", admin.DateFieldListFilter),
        ("provided_at", admin.DateFieldListFilter),
    )
    search_fields = ("name", "user__username", "description")
    raw_id_fields = ("user", "added_by")
    readonly_fields = ("provided_at", "updated_at")
    inlines = (AssignmentFileInline,)
    fieldsets = (
        ("Assignment", {"fields": ("user", "name", "description")}),
        (
            "Classification",
            {"fields": ("assignment_type", "work_type", "delivery_date", "delivered_date")},
        ),
        ("Status", {"fields": ("status", "is_paid", "is_working", "added_by", "completed_file")}),
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
class AssignmentFileAdmin(admin.ModelAdmin):
    list_display = ("file_name", "assignment", "file_type", "uploaded_at")
    list_display_links = ("file_name",)
    list_filter = ("file_type", ("uploaded_at", admin.DateFieldListFilter))
    search_fields = ("file_name", "assignment__name")
    raw_id_fields = ("assignment",)
    readonly_fields = ("uploaded_at",)
    fieldsets = (
        ("File", {"fields": ("assignment", "file_name", "file_type", "file")}),
        ("Timestamps", {"fields": ("uploaded_at",)}),
    )
