from django.db import models

class BusyDate(models.Model):
    REASON_CHOICES = (
        ('heavy_assignments', 'Heavy Assignments'),
        ('holiday', 'Holiday'),
    )
    
    # The actual calendar date marked as unavailable
    date = models.DateField(unique=True)
    
    # Contextual data linked to the defined selections
    reason = models.CharField(
        max_length=50, 
        choices=REASON_CHOICES, 
        default='heavy_assignments'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'busy_dates'
        ordering = ['date']

    def __str__(self):
        # %b = Short month name (e.g., Jan, Jun)
        # %d = Day of the month as a zero-padded decimal (e.g., 01, 11)
        # %Y = 4-digit year (e.g., 2026)
        # %d.lstrip('0') or standard format cleans up leading zeros
        formatted_date = self.date.strftime("%b %d, %Y")
        return f"{formatted_date} - ({self.get_reason_display()})"