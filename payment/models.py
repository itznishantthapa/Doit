from django.db import models
from django.conf import settings
# Import your assignment model cleanly from its app directory
from assignment.models import Assignment 

class PaymentDetails(models.Model):
    """
    Administrative configurations table storing active payment channels, 
    bank account IDs, and official QR code image configurations.
    """
    pay_id = models.CharField(
        max_length=100, 
        unique=True, 
        help_text="e.g., PayID, BSB/Account Number, or Transaction Reference identifier"
    )
    pay_name = models.CharField(
        max_length=255, 
        help_text="The official registered legal name associated with the payment channel"
    )
    pay_qr = models.ImageField(
        upload_to='payment_channels/qr_codes/', 
        blank=True, 
        null=True
    )
    qr_description = models.TextField(
        blank=True, 
        null=True, 
        help_text="Instructions or terms displayed to the user beneath the QR code layout"
    )
    
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'payment_details'
        verbose_name = "Payment Detail Specification"
        verbose_name_plural = "Payment Details Specifications"

    def __str__(self):
        return f"{self.pay_name} - PAY ID: {self.pay_id}"


class AssignmentPayment(models.Model):
    """
    Transactional ledger tracking payment screenshot verification requests 
    uploaded by clients for their explicit assignments.
    """
    # Core structural relationships
    assignment = models.ForeignKey(
        Assignment, 
        on_delete=models.CASCADE, 
        related_name='payments'
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='user_payments'
    )
    
    # Financial metrics & digital assets tracking fields
    payment_ss = models.ImageField(
        upload_to='assignments/payment_receipts/', 
        help_text="The verification receipt/screenshot uploaded by the student client"
    )
    pay_amount = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        help_text="The exact monetary amount processed for this transaction milestone"
    )
    
    # Timestamps
    pay_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'assignment_payments'
        ordering = ['-pay_at']

    def __str__(self):
        return f"Payment of ${self.pay_amount} for Assignment ID: {self.assignment_id} by User: {self.user.username}"