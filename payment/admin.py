from django.contrib import admin

# Register your models here.
from .models import PaymentDetails, AssignmentPayment

admin.site.register(PaymentDetails)
admin.site.register(AssignmentPayment)