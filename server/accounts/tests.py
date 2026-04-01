from django.test import TestCase
from rest_framework.test import APIClient
from django.contrib.auth.models import User


class RegisterTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_register_success_returns_tokens_and_user(self):
        res = self.client.post('/api/auth/register/', {
            'email': 'new@example.com',
            'password': 'securepass123',
            'first_name': 'Jane',
            'last_name': 'Doe',
        }, format='json')
        self.assertEqual(res.status_code, 201)
        self.assertIn('access', res.data)
        self.assertIn('refresh', res.data)
        self.assertEqual(res.data['user']['email'], 'new@example.com')
        self.assertTrue(User.objects.filter(username='new@example.com').exists())

    def test_register_duplicate_email_returns_400(self):
        User.objects.create_user(username='taken@example.com', email='taken@example.com', password='pass')
        res = self.client.post('/api/auth/register/', {
            'email': 'taken@example.com', 'password': 'securepass123'
        }, format='json')
        self.assertEqual(res.status_code, 400)
        self.assertIn('error', res.data)

    def test_register_short_password_returns_400(self):
        res = self.client.post('/api/auth/register/', {
            'email': 'new2@example.com', 'password': 'short'
        }, format='json')
        self.assertEqual(res.status_code, 400)

    def test_register_missing_email_returns_400(self):
        res = self.client.post('/api/auth/register/', {
            'password': 'securepass123'
        }, format='json')
        self.assertEqual(res.status_code, 400)


class LoginTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        User.objects.create_user(
            username='user@example.com',
            email='user@example.com',
            password='testpass123'
        )

    def test_login_success_returns_access_and_refresh(self):
        res = self.client.post('/api/auth/token/', {
            'username': 'user@example.com',
            'password': 'testpass123',
        }, format='json')
        self.assertEqual(res.status_code, 200)
        self.assertIn('access', res.data)
        self.assertIn('refresh', res.data)

    def test_login_wrong_password_returns_401(self):
        res = self.client.post('/api/auth/token/', {
            'username': 'user@example.com',
            'password': 'wrongpass',
        }, format='json')
        self.assertEqual(res.status_code, 401)


class MeTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='me@example.com',
            email='me@example.com',
            password='pass123',
            first_name='Kay',
        )

    def test_me_authenticated_returns_user_data(self):
        self.client.force_authenticate(user=self.user)
        res = self.client.get('/api/auth/me/')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data['email'], 'me@example.com')
        self.assertEqual(res.data['first_name'], 'Kay')
        self.assertIn('is_staff', res.data)

    def test_me_unauthenticated_returns_401(self):
        res = self.client.get('/api/auth/me/')
        self.assertEqual(res.status_code, 401)
