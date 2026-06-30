from django.db import models
from assignment.models import Assignment  # Import your existing Assignment model

class AssignmentProgress(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('doing', 'Doing'),
        ('completed', 'Completed'),
        ('rejected', 'Rejected'),
    )

    # Strictly links one tracking state profile to one explicit assignment
    assignment = models.OneToOneField(
        Assignment, 
        on_delete=models.CASCADE, 
        related_name='progress'
    )

    # -------------------------------------------------------------------------
    # STEP 1: PROVIDED FIELDS
    # -------------------------------------------------------------------------
    provided_date = models.DateTimeField(auto_now_add=True)
    provided_is_active = models.BooleanField(default=True)
    provided_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')

    # -------------------------------------------------------------------------
    # STEP 2: PAYMENT FIELDS
    # -------------------------------------------------------------------------
    price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True) # E.g., 20.00
    payment_receipt_date = models.DateTimeField(blank=True, null=True)
    payment_done_date = models.DateTimeField(blank=True, null=True)
    payment_is_active = models.BooleanField(default=False)
    payment_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    payment_attempt_count = models.PositiveIntegerField(default=0)
    
    # Store the actual uploaded user receipts/screenshots
    payment_screenshot = models.ImageField(upload_to='payments/screenshots/', blank=True, null=True)
    # Administrative reference details image
    payment_details_image = models.ImageField(upload_to='payments/details/', blank=True, null=True)

    # -------------------------------------------------------------------------
    # STEP 3: DOING FIELDS
    # -------------------------------------------------------------------------
    doing_date = models.DateTimeField(blank=True, null=True)
    doing_is_active = models.BooleanField(default=False)
    doing_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')

    # -------------------------------------------------------------------------
    # STEP 4: COMPLETED FIELDS
    # -------------------------------------------------------------------------
    completed_date = models.DateTimeField(blank=True, null=True)
    completed_is_active = models.BooleanField(default=False)
    completed_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')

    class Meta:
        db_table = 'assignment_progress'
        verbose_name = 'Assignment Progress'
        verbose_name_plural = 'Assignment Progresses'

    def __str__(self):
        return f"Progress Profile for Assignment: {self.assignment.name} (ID: {self.assignment_id})"