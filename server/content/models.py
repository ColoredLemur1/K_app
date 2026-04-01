from django.db import models
from django.contrib.auth.models import User


class PortfolioItem(models.Model):
    CATEGORY_CHOICES = [
        ('wedding', 'Wedding'),
        ('portrait', 'Portrait'),
        ('event', 'Event'),
        ('landscape', 'Landscape'),
        ('product', 'Product'),
    ]
    title = models.CharField(max_length=200)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    image = models.ImageField(upload_to='portfolio/')
    featured = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', '-created_at']

    def __str__(self):
        return self.title


class AvailabilitySlot(models.Model):
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    is_booked = models.BooleanField(default=False)

    class Meta:
        ordering = ['date', 'start_time']
        unique_together = ['date', 'start_time']

    def __str__(self):
        return f"{self.date} {self.start_time}–{self.end_time}"


class BookingRequest(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('declined', 'Declined'),
        ('cancelled', 'Cancelled'),
        ('completed', 'Completed'),
    ]
    SESSION_TYPES = [
        ('wedding', 'Wedding'),
        ('portrait', 'Portrait'),
        ('event', 'Event'),
        ('landscape', 'Landscape'),
        ('product', 'Product'),
    ]
    customer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookings')
    session_type = models.CharField(max_length=50, choices=SESSION_TYPES)
    location = models.CharField(max_length=300)
    postcode = models.CharField(max_length=10)
    is_home_visit = models.BooleanField(default=False)
    slot = models.OneToOneField(
        AvailabilitySlot, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='booking'
    )
    notes = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.customer.email} — {self.session_type} ({self.status})"


class EditingRequest(models.Model):
    STATUS_CHOICES = [
        ('requested', 'Requested'),
        ('confirmed', 'Confirmed'),
        ('in_progress', 'In Progress'),
        ('delivered', 'Delivered'),
        ('declined', 'Declined'),
    ]
    customer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='editing_requests')
    style_notes = models.TextField()
    turnaround = models.CharField(max_length=100)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='requested')
    quoted_price = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.customer.email} — editing ({self.status})"


class EditingFile(models.Model):
    editing_request = models.ForeignKey(
        EditingRequest, on_delete=models.CASCADE, related_name='files'
    )
    file = models.FileField(upload_to='editing/')
    uploaded_at = models.DateTimeField(auto_now_add=True)


class Payment(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    ]
    booking = models.OneToOneField(
        BookingRequest, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='payment'
    )
    editing_request = models.OneToOneField(
        EditingRequest, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='payment'
    )
    stripe_payment_intent_id = models.CharField(max_length=200, unique=True)
    amount = models.DecimalField(max_digits=8, decimal_places=2)
    currency = models.CharField(max_length=3, default='GBP')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    paid_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Payment {self.stripe_payment_intent_id} ({self.status})"


class Message(models.Model):
    THREAD_TYPES = [
        ('booking', 'Booking'),
        ('editing', 'Editing'),
    ]
    thread_type = models.CharField(max_length=20, choices=THREAD_TYPES)
    thread_id = models.PositiveBigIntegerField()
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='messages')
    body = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    class Meta:
        ordering = ['timestamp']

    def __str__(self):
        return f"{self.thread_type}#{self.thread_id} from {self.sender.email}"
