from django.contrib import admin
from .models import Assignment, AssignmentFile

# Register your models here.
admin.site.register(Assignment)
admin.site.register(AssignmentFile)