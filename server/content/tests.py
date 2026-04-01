from django.test import TestCase
from django.contrib.auth.models import User
from .models import (
    PortfolioItem, AvailabilitySlot, BookingRequest,
    EditingRequest, EditingFile, Payment, Message
)
import datetime

class ModelSmokeTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='customer@example.com',
            email='customer@example.com',
            password='testpass123'
        )

    def test_portfolio_item_creation(self):
        item = PortfolioItem.objects.create(
            title='Wedding Shot', category='wedding', image='portfolio/test.jpg'
        )
        self.assertEqual(str(item), 'Wedding Shot')
        self.assertFalse(item.featured)
        self.assertEqual(item.order, 0)

    def test_availability_slot_creation(self):
        slot = AvailabilitySlot.objects.create(
            date=datetime.date(2026, 6, 1),
            start_time=datetime.time(10, 0),
            end_time=datetime.time(12, 0),
        )
        self.assertFalse(slot.is_booked)

    def test_booking_request_creation(self):
        slot = AvailabilitySlot.objects.create(
            date=datetime.date(2026, 6, 1),
            start_time=datetime.time(10, 0),
            end_time=datetime.time(12, 0),
        )
        booking = BookingRequest.objects.create(
            customer=self.user,
            session_type='portrait',
            location='12 High Street, Oxford',
            postcode='OX1 3DP',
            is_home_visit=True,
            slot=slot,
        )
        self.assertEqual(booking.status, 'pending')

    def test_editing_request_and_file(self):
        req = EditingRequest.objects.create(
            customer=self.user,
            style_notes='Natural light, warm tones',
            turnaround='5 days',
        )
        self.assertEqual(req.status, 'requested')
        self.assertIsNone(req.quoted_price)
        f = EditingFile.objects.create(editing_request=req, file='editing/photo.jpg')
        self.assertEqual(f.editing_request, req)

    def test_payment_linked_to_booking(self):
        booking = BookingRequest.objects.create(
            customer=self.user,
            session_type='event',
            location='Town Hall',
            postcode='OX1 1AA',
        )
        payment = Payment.objects.create(
            booking=booking,
            stripe_payment_intent_id='pi_test_123',
            amount='150.00',
        )
        self.assertEqual(payment.status, 'pending')
        self.assertEqual(payment.currency, 'GBP')

    def test_message_creation(self):
        booking = BookingRequest.objects.create(
            customer=self.user,
            session_type='portrait',
            location='Home',
            postcode='OX2 1AA',
        )
        msg = Message.objects.create(
            thread_type='booking',
            thread_id=booking.id,
            sender=self.user,
            body='Hi Kay, I was wondering about the session.',
        )
        self.assertFalse(msg.is_read)
