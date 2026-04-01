# Foundation & Auth Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire up JWT authentication (register/login/me), all Django data models, and React Router with protected routes and Login/Register pages.

**Architecture:** Django provides JWT auth via `djangorestframework-simplejwt`. All data models live in `content/models.py`. The React frontend uses `react-router-dom` for routing with an `AuthContext` that persists the JWT token in localStorage. Placeholder routes for all functional pages are added now so later plans can fill them in.

**Tech Stack:** Django 6 · DRF · djangorestframework-simplejwt · React 18 · react-router-dom · TypeScript · Tailwind

---

## File Map

### Backend — create or modify

| File | Action | Responsibility |
|---|---|---|
| `server/requirements.txt` | Modify | Add `djangorestframework-simplejwt`, `Pillow` |
| `server/backend/settings.py` | Modify | Add JWT config, MEDIA settings, `SERVICE_AREA_POSTCODES`, `DEFAULT_AUTO_FIELD` |
| `server/backend/urls.py` | Modify | Mount auth URLs at `/api/auth/`, content URLs at `/api/`, move Django admin to `/django-admin/` |
| `server/content/models.py` | Modify | All domain models: PortfolioItem, AvailabilitySlot, BookingRequest, EditingRequest, EditingFile, Payment, Message |
| `server/content/admin.py` | Modify | Register all models with Django admin |
| `server/accounts/views.py` | Modify | `register` and `me` endpoints |
| `server/accounts/urls.py` | Create | Auth URL patterns |
| `server/accounts/tests.py` | Modify | Tests for register, login, me |

### Frontend — create or modify

| File | Action | Responsibility |
|---|---|---|
| `client/package.json` | Modify | Add `react-router-dom`, `gsap` |
| `client/src/app/App.tsx` | Modify | Replace useState routing with BrowserRouter + Routes |
| `client/src/app/context/AuthContext.tsx` | Create | JWT token storage, user state, login/logout |
| `client/src/app/lib/api.ts` | Create | Typed fetch wrapper that attaches Bearer token |
| `client/src/app/pages/LoginPage.tsx` | Create | Email/password login form |
| `client/src/app/pages/RegisterPage.tsx` | Create | Registration form |
| `client/src/app/components/ProtectedRoute.tsx` | Create | Redirects unauthenticated users; `requireStaff` variant for admin |

---

## Task 1: Install backend dependencies

**Files:**
- Modify: `server/requirements.txt`

- [ ] **Step 1: Add missing packages to requirements.txt**

Open `server/requirements.txt` and add these two lines:
```
djangorestframework-simplejwt==5.4.0
Pillow==11.2.1
```

- [ ] **Step 2: Install them**

```bash
cd server
venv/Scripts/pip install djangorestframework-simplejwt==5.4.0 Pillow==11.2.1
```

Expected output ends with: `Successfully installed djangorestframework-simplejwt-5.4.0 Pillow-11.2.1`

- [ ] **Step 3: Commit**

```bash
git add server/requirements.txt
git commit -m "chore: add simplejwt and Pillow to requirements"
```

---

## Task 2: Update Django settings

**Files:**
- Modify: `server/backend/settings.py`

- [ ] **Step 1: Add the JWT and DRF config block**

Add this block anywhere after the `INSTALLED_APPS` list in `server/backend/settings.py`:

```python
# --- REST Framework & JWT ---
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
}

from datetime import timedelta
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
}

# --- Media files (portfolio images, editing uploads) ---
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# --- Service area (postcode prefixes Kay accepts for home visits) ---
SERVICE_AREA_POSTCODES = ['OX1', 'OX2', 'OX3', 'OX4', 'OX5', 'OX14', 'OX18']

# --- Consistent primary key type ---
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
```

- [ ] **Step 2: Add `rest_framework_simplejwt` to INSTALLED_APPS**

In the `INSTALLED_APPS` list, add:
```python
'rest_framework_simplejwt',
```

- [ ] **Step 3: Verify Django still starts**

```bash
cd server
venv/Scripts/python manage.py check
```

Expected: `System check identified no issues (0 silenced).`

- [ ] **Step 4: Commit**

```bash
git add server/backend/settings.py
git commit -m "chore: configure JWT auth, media files, service area setting"
```

---

## Task 3: Create all domain models

**Files:**
- Modify: `server/content/models.py`

- [ ] **Step 1: Write the failing test first**

Replace `server/content/tests.py` with:

```python
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
```

- [ ] **Step 2: Run the test to confirm it fails**

```bash
cd server
venv/Scripts/python manage.py test content.tests -v 2
```

Expected: `ImportError` or `AttributeError` — models don't exist yet.

- [ ] **Step 3: Write all the models**

Replace `server/content/models.py` with:

```python
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
```

- [ ] **Step 4: Register models in admin**

Replace `server/content/admin.py` with:

```python
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
```

- [ ] **Step 5: Make and run migrations**

```bash
cd server
venv/Scripts/python manage.py makemigrations content
venv/Scripts/python manage.py migrate
```

Expected: migration file created, then `OK` for each applied migration.

- [ ] **Step 6: Run the tests — expect them to pass**

```bash
venv/Scripts/python manage.py test content.tests -v 2
```

Expected: `Ran 6 tests in X.XXXs` — `OK`

- [ ] **Step 7: Commit**

```bash
git add server/content/models.py server/content/admin.py server/content/tests.py server/content/migrations/
git commit -m "feat: add all domain models (PortfolioItem, Booking, Editing, Payment, Message)"
```

---

## Task 4: Auth API — register and me endpoints

**Files:**
- Modify: `server/accounts/views.py`
- Create: `server/accounts/urls.py`
- Modify: `server/backend/urls.py`

- [ ] **Step 1: Write the failing tests**

Replace `server/accounts/tests.py` with:

```python
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
```

- [ ] **Step 2: Run to confirm they fail**

```bash
cd server
venv/Scripts/python manage.py test accounts.tests -v 2
```

Expected: `404` or `ImportError` — URLs don't exist yet.

- [ ] **Step 3: Write the register and me views**

Replace `server/accounts/views.py` with:

```python
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    email = request.data.get('email', '').strip().lower()
    password = request.data.get('password', '')
    first_name = request.data.get('first_name', '').strip()
    last_name = request.data.get('last_name', '').strip()

    if not email:
        return Response({'error': 'Email is required.'}, status=400)
    if not password:
        return Response({'error': 'Password is required.'}, status=400)
    if len(password) < 8:
        return Response({'error': 'Password must be at least 8 characters.'}, status=400)
    if User.objects.filter(username=email).exists():
        return Response({'error': 'An account with this email already exists.'}, status=400)

    user = User.objects.create_user(
        username=email,
        email=email,
        password=password,
        first_name=first_name,
        last_name=last_name,
    )
    refresh = RefreshToken.for_user(user)
    return Response({
        'access': str(refresh.access_token),
        'refresh': str(refresh),
        'user': {
            'id': user.id,
            'email': user.email,
            'first_name': user.first_name,
            'is_staff': user.is_staff,
        },
    }, status=201)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):
    user = request.user
    return Response({
        'id': user.id,
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'is_staff': user.is_staff,
    })
```

- [ ] **Step 4: Create accounts/urls.py**

Create `server/accounts/urls.py`:

```python
from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from . import views

urlpatterns = [
    path('register/', views.register),
    path('token/', TokenObtainPairView.as_view()),
    path('token/refresh/', TokenRefreshView.as_view()),
    path('me/', views.me),
]
```

- [ ] **Step 5: Update the root URL config**

Replace `server/backend/urls.py` with:

```python
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('django-admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/', include('content.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
```

- [ ] **Step 6: Create a minimal content/urls.py so the import doesn't error**

Create `server/content/urls.py`:

```python
from django.urls import path

urlpatterns = []  # endpoints added in later plans
```

- [ ] **Step 7: Run the auth tests — expect them to pass**

```bash
cd server
venv/Scripts/python manage.py test accounts.tests -v 2
```

Expected: `Ran 7 tests in X.XXXs` — `OK`

- [ ] **Step 8: Commit**

```bash
git add server/accounts/views.py server/accounts/urls.py server/accounts/tests.py server/backend/urls.py server/content/urls.py
git commit -m "feat: add JWT auth endpoints (register, login, me)"
```

---

## Task 5: Frontend — install packages and set up routing

**Files:**
- Modify: `client/package.json`
- Modify: `client/src/app/App.tsx`

- [ ] **Step 1: Install react-router-dom and gsap**

```bash
cd client
npm install react-router-dom@7 gsap@3
```

Expected: both appear in `node_modules/` and `package.json` dependencies.

- [ ] **Step 2: Commit the lockfile update**

```bash
git add client/package.json client/package-lock.json
git commit -m "chore: add react-router-dom and gsap"
```

---

## Task 6: AuthContext and API client

**Files:**
- Create: `client/src/app/context/AuthContext.tsx`
- Create: `client/src/app/lib/api.ts`

- [ ] **Step 1: Create the AuthContext**

Create `client/src/app/context/AuthContext.tsx`:

```tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface AuthUser {
  id: number;
  email: string;
  first_name: string;
  is_staff: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  login: (accessToken: string, refreshToken: string, user: AuthUser) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('access_token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.clear();
      }
    }
    setIsLoading(false);
  }, []);

  const login = (accessToken: string, refreshToken: string, userData: AuthUser) => {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(accessToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
```

- [ ] **Step 2: Create the API client**

Create `client/src/app/lib/api.ts`:

```ts
const BASE_URL = 'http://localhost:8000/api';

function getHeaders(): HeadersInit {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: getHeaders(),
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err: { status: number; data: unknown } = { status: res.status, data };
    throw err;
  }
  return data as T;
}

export async function apiPostForm<T>(path: string, formData: FormData): Promise<T> {
  const token = localStorage.getItem('access_token');
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw { status: res.status, data };
  return data as T;
}

export const api = {
  get:    <T>(path: string)                  => request<T>('GET',    path),
  post:   <T>(path: string, body: unknown)   => request<T>('POST',   path, body),
  patch:  <T>(path: string, body: unknown)   => request<T>('PATCH',  path, body),
  delete: <T>(path: string)                  => request<T>('DELETE', path),
};
```

- [ ] **Step 3: Commit**

```bash
git add client/src/app/context/AuthContext.tsx client/src/app/lib/api.ts
git commit -m "feat: add AuthContext and typed API client"
```

---

## Task 7: ProtectedRoute component

**Files:**
- Create: `client/src/app/components/ProtectedRoute.tsx`

- [ ] **Step 1: Create the component**

Create `client/src/app/components/ProtectedRoute.tsx`:

```tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface Props {
  children: React.ReactNode;
  requireStaff?: boolean;
}

export function ProtectedRoute({ children, requireStaff = false }: Props) {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (requireStaff && !user.is_staff) return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
}
```

- [ ] **Step 2: Commit**

```bash
git add client/src/app/components/ProtectedRoute.tsx
git commit -m "feat: add ProtectedRoute component"
```

---

## Task 8: Login page

**Files:**
- Create: `client/src/app/pages/LoginPage.tsx`

- [ ] **Step 1: Create the Login page**

Create `client/src/app/pages/LoginPage.tsx`:

```tsx
import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import type { AuthUser } from '../context/AuthContext';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const tokens = await api.post<{ access: string; refresh: string }>(
        '/auth/token/',
        { username: email, password }
      );
      // Temporarily set token so the /me call is authenticated
      localStorage.setItem('access_token', tokens.access);
      const user = await api.get<AuthUser>('/auth/me/');
      login(tokens.access, tokens.refresh, user);
      navigate(user.is_staff ? '/admin' : '/dashboard');
    } catch {
      localStorage.removeItem('access_token');
      setError('Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 14px',
    border: '1px solid #ddd', fontSize: 14,
    outline: 'none', fontFamily: 'inherit',
  };
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: 11,
    letterSpacing: 1, textTransform: 'uppercase',
    color: '#555', marginBottom: 6,
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff' }}>
      <div style={{ width: '100%', maxWidth: 400, padding: '48px 32px' }}>
        <h1 style={{ fontSize: 28, fontWeight: 300, letterSpacing: '-0.5px', marginBottom: 8 }}>Log in</h1>
        <p style={{ color: '#888', fontSize: 13, marginBottom: 32 }}>Kay Tubillla Photography</p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Email</label>
            <input
              type="email" value={email} required autoComplete="email"
              onChange={e => setEmail(e.target.value)} style={inputStyle}
            />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={labelStyle}>Password</label>
            <input
              type="password" value={password} required autoComplete="current-password"
              onChange={e => setPassword(e.target.value)} style={inputStyle}
            />
          </div>

          {error && (
            <p style={{ color: '#b91c1c', fontSize: 13, marginBottom: 16 }}>{error}</p>
          )}

          <button
            type="submit" disabled={loading}
            style={{
              width: '100%', padding: 14,
              background: loading ? '#555' : '#111', color: '#fff',
              fontSize: 12, fontWeight: 700, letterSpacing: 2,
              textTransform: 'uppercase', border: 'none', cursor: loading ? 'default' : 'pointer',
            }}
          >
            {loading ? 'Logging in…' : 'Log In'}
          </button>
        </form>

        <p style={{ fontSize: 13, color: '#888', marginTop: 24, textAlign: 'center' }}>
          No account?{' '}
          <Link to="/register" style={{ color: '#111', fontWeight: 600 }}>Register</Link>
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add client/src/app/pages/LoginPage.tsx
git commit -m "feat: add Login page"
```

---

## Task 9: Register page

**Files:**
- Create: `client/src/app/pages/RegisterPage.tsx`

- [ ] **Step 1: Create the Register page**

Create `client/src/app/pages/RegisterPage.tsx`:

```tsx
import { useState, FormEvent, ChangeEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import type { AuthUser } from '../context/AuthContext';

interface RegisterResponse {
  access: string;
  refresh: string;
  user: AuthUser;
}

export function RegisterPage() {
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const set = (field: keyof typeof form) =>
    (e: ChangeEvent<HTMLInputElement>) =>
      setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post<RegisterResponse>('/auth/register/', form);
      login(res.access, res.refresh, res.user);
      navigate('/dashboard');
    } catch (err: unknown) {
      const e = err as { data?: { error?: string } };
      setError(e.data?.error ?? 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 14px',
    border: '1px solid #ddd', fontSize: 14,
    outline: 'none', fontFamily: 'inherit',
  };
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: 11,
    letterSpacing: 1, textTransform: 'uppercase',
    color: '#555', marginBottom: 6,
  };

  const fields: { field: keyof typeof form; label: string; type: string; autocomplete: string }[] = [
    { field: 'first_name', label: 'First name',  type: 'text',     autocomplete: 'given-name' },
    { field: 'last_name',  label: 'Last name',   type: 'text',     autocomplete: 'family-name' },
    { field: 'email',      label: 'Email',        type: 'email',    autocomplete: 'email' },
    { field: 'password',   label: 'Password',     type: 'password', autocomplete: 'new-password' },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff' }}>
      <div style={{ width: '100%', maxWidth: 400, padding: '48px 32px' }}>
        <h1 style={{ fontSize: 28, fontWeight: 300, letterSpacing: '-0.5px', marginBottom: 8 }}>Create account</h1>
        <p style={{ color: '#888', fontSize: 13, marginBottom: 32 }}>Kay Tubillla Photography</p>

        <form onSubmit={handleSubmit}>
          {fields.map(({ field, label, type, autocomplete }) => (
            <div key={field} style={{ marginBottom: 16 }}>
              <label style={labelStyle}>{label}</label>
              <input
                type={type} value={form[field]} required
                autoComplete={autocomplete}
                onChange={set(field)} style={inputStyle}
              />
            </div>
          ))}

          {error && (
            <p style={{ color: '#b91c1c', fontSize: 13, marginBottom: 16 }}>{error}</p>
          )}

          <button
            type="submit" disabled={loading}
            style={{
              width: '100%', padding: 14, marginTop: 8,
              background: loading ? '#555' : '#111', color: '#fff',
              fontSize: 12, fontWeight: 700, letterSpacing: 2,
              textTransform: 'uppercase', border: 'none', cursor: loading ? 'default' : 'pointer',
            }}
          >
            {loading ? 'Creating account…' : 'Register'}
          </button>
        </form>

        <p style={{ fontSize: 13, color: '#888', marginTop: 24, textAlign: 'center' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#111', fontWeight: 600 }}>Log in</Link>
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add client/src/app/pages/RegisterPage.tsx
git commit -m "feat: add Register page"
```

---

## Task 10: Wire up React Router in App.tsx

**Files:**
- Modify: `client/src/app/App.tsx`

- [ ] **Step 1: Replace App.tsx with routed version**

Replace the entire contents of `client/src/app/App.tsx` with:

```tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Portfolio } from './components/Portfolio';
import { Packages } from './components/Packages';
import { About } from './components/About';
import { Contact } from './components/Contact';
import { Footer } from './components/Footer';

function HomePage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <Portfolio />
        <Packages />
        <About />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}

// Placeholder pages — replaced in later plans
function ComingSoon({ label }: { label: string }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ fontSize: 14, color: '#888' }}>{label} — coming soon</p>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/"         element={<HomePage />} />
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Customer (login required) */}
          <Route path="/book"      element={<ProtectedRoute><ComingSoon label="Book a Session" /></ProtectedRoute>} />
          <Route path="/editing"   element={<ProtectedRoute><ComingSoon label="Photo Editing" /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><ComingSoon label="Dashboard" /></ProtectedRoute>} />
          <Route path="/messages"  element={<ProtectedRoute><ComingSoon label="Messages" /></ProtectedRoute>} />

          {/* Admin (Kay only) */}
          <Route path="/admin/*" element={<ProtectedRoute requireStaff><ComingSoon label="Admin" /></ProtectedRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
```

- [ ] **Step 2: Update Header to remove the old onNavigate prop**

The existing `Header` component uses an `onNavigate` prop from the old `useState` routing. Open `client/src/app/components/Header.tsx` and replace any `onNavigate` usage with `react-router-dom`'s `<Link>` or `useNavigate`. The exact change depends on the current Header code — read it first, then update navigation calls to use `<Link to="/login">` and `<Link to="/register">` instead of calling `onNavigate`.

- [ ] **Step 3: Start both servers and verify manually**

```bash
# Terminal 1 — Django
cd server && venv/Scripts/python manage.py runserver

# Terminal 2 — Vite
cd client && npm run dev
```

Open http://localhost:5173 — homepage should load.  
Navigate to http://localhost:5173/login — Login page should render.  
Navigate to http://localhost:5173/register — Register page should render.  
Navigate to http://localhost:5173/book — should redirect to `/login`.  
Register a new account — should land on `/dashboard` (placeholder page).  
Log in with that account — should land on `/dashboard`.

- [ ] **Step 4: Commit**

```bash
git add client/src/app/App.tsx client/src/app/components/Header.tsx
git commit -m "feat: wire up React Router, protect routes, hook up Login and Register"
```

---

## Self-Review

**Spec coverage check:**
- ✅ §9 Auth — JWT register, login, me endpoints implemented; customer self-register; Kay manually via Django shell; staff check on protected routes
- ✅ §12 Models — all 7 models defined with correct fields, constraints, and relationships
- ✅ §3 Routes — all public, customer, and admin routes wired in React Router
- ✅ §3 Admin URL conflict — Django admin remounted at `/django-admin/`
- ✅ §15 Dependencies — `djangorestframework-simplejwt`, `Pillow`, `react-router-dom`, `gsap` added
- ⏭ All other spec sections (homepage visuals, booking flow, editing, payments, admin panel, messaging) — covered by Plans 2–7

**Placeholder scan:** No TBDs or TODOs present. Task 10 Step 2 gives explicit instruction (read Header first, update nav calls) rather than leaving it vague.

**Type consistency:** `AuthUser` interface defined in `AuthContext.tsx` and imported by both `LoginPage.tsx` and `RegisterPage.tsx`. `api.ts` `request<T>` generic used consistently across all call sites.
