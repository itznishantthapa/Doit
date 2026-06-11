from django.contrib import admin

from .models import User


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('username', 'role', 'is_active', 'is_suspended', 'created_at')
    list_filter = ('role', 'is_active', 'is_suspended')
    search_fields = ('username', 'device_id')
    readonly_fields = ('created_at', 'updated_at', 'last_login')
