from django.contrib import admin
from .models import (
    PortfolioItem, AvailabilitySlot, BookingRequest,
    EditingRequest, EditingFile, Payment, Message
)

admin.site.register(PortfolioItem)
admin.site.register(AvailabilitySlot)
admin.site.register(BookingRequest)
admin.site.register(EditingRequest)
admin.site.register(EditingFile)
admin.site.register(Payment)
admin.site.register(Message)
