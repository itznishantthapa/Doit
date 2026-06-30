from django.db import models
from django.conf import settings

class Assignment(models.Model):
    ASSIGNMENT_TYPE_CHOICES = (
        ('assessment', 'Assessment'),
        ('tutorial', 'Tutorial'),
        ('others', 'Others'),
    )
    
    WORK_TYPE_CHOICES = (
        ('individual', 'Individual'),
        ('group', 'Group'),
    )

    STATUS_CHOICES = (
        ('in_review', 'In Review'),
        ('rejected', 'Rejected'),
        ('payment_pending', 'Payment Pending'),
        ('payment_rejected', 'Payment Rejected'),
        ('doing', 'Doing'),
        ('completed', 'Completed'),
        ('unsubmitted', 'Unsubmitted'),
    )

    PENDING_STATUSES = ('in_review', 'payment_pending', 'doing','unsubmitted')
    COMPLETED_STATUS = 'completed'

    # Core relationship (Links assignment to the user who uploaded it)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='assignments'
    )

    # Basic Info payload mappings
    name = models.CharField(max_length=255)
    assignment_type = models.CharField(max_length=50, choices=ASSIGNMENT_TYPE_CHOICES, default='assessment')
    work_type = models.CharField(max_length=50, choices=WORK_TYPE_CHOICES, default='individual')
    description = models.TextField(blank=True, null=True)
    
    # Scheduling dates
    delivery_date = models.DateField()  # Maps directly to "2026-06-14"
    
    # Financial & State tracking metrics
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='in_review')
    is_paid = models.BooleanField(default=False)
    is_working = models.BooleanField(default=False)
    added_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='added_assignments',
        limit_choices_to={'role': 'admin'},
    )

    # changes request
    changes_request_description = models.TextField(blank=True, null=True)
    changes_request_count = models.IntegerField(default=0)
    changes_request_resolved_count = models.IntegerField(default=0)

    completed_file = models.FileField(
        upload_to='assignments/completed_solutions/', 
        blank=True, 
        null=True,
        help_text="The final completed solution file uploaded by the assignment helper"
    )
    
    # System timestamps
    provided_at = models.DateTimeField(auto_now_add=True)  # Assignment creation timestamp
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'assignments'
        ordering = ['-provided_at']  # Newest uploads appear first

    def __str__(self):
        return f"{self.name} - ({self.get_status_display()})"


class AssignmentFile(models.Model):
    """
    Holds individual uploaded attachments belonging to a parental Assignment setup.
    Handles 'Weekly.pdf', '1000155159.jpg', etc.
    """
    # Links many files cleanly back to one explicit Assignment box instance
    assignment = models.ForeignKey(
        Assignment, 
        on_delete=models.CASCADE, 
        related_name='files'
    )
    
    # File structural descriptors matching your frontend properties
    file_name = models.CharField(max_length=255)  # e.g., "Weekly.pdf"
    file_type = models.CharField(max_length=255)   # e.g., "document", "image"
    
    # Actual file storage handling field mapping on disk space container system
    file = models.FileField(upload_to='assignments/attachments/')
    
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'assignment_files'

    def __str__(self):
        return f"File: {self.file_name} for Assignment ID: {self.assignment_id}"