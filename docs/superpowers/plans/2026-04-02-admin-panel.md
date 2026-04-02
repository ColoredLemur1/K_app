# Admin Panel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a secure admin interface for Kay (the photographer) to view stats and manage booking and editing requests — accessible only to `is_staff` users.

**Architecture:** Seven new DRF endpoints added to `server/content/views.py` and `server/content/urls.py`, all behind `IsAdminUser`. Four new React pages/components under `client/src/app/`. `App.tsx` wires the new routes; `Header.tsx` gains a staff-only "Admin" link. `LoginPage.tsx` already redirects staff users to `/admin` — no change needed there.

**Tech Stack:** Django REST Framework (`IsAdminUser`), React + TypeScript, `api.ts` fetch helpers, inline styles (Helvetica Neue, monochrome palette matching existing app).

---

## File Map

### Backend — modified
| File | Change |
|---|---|
| `server/content/views.py` | Add 7 admin views: `admin_stats`, `admin_bookings_list`, `admin_booking_status`, `admin_booking_message`, `admin_editing_list`, `admin_editing_status`, `admin_editing_message` |
| `server/content/urls.py` | Register all 7 admin URL patterns under `admin/` |

### Frontend — new files
| File | Purpose |
|---|---|
| `client/src/app/components/admin/AdminLayout.tsx` | Top-tab shell, sticky nav, content wrapper |
| `client/src/app/pages/admin/AdminDashboard.tsx` | Stat cards + recent activity tables |
| `client/src/app/pages/admin/AdminBookings.tsx` | Filterable table with inline confirm/decline/message |
| `client/src/app/pages/admin/AdminEditing.tsx` | Filterable table with status select, inline price, message |

### Frontend — modified files
| File | Change |
|---|---|
| `client/src/app/App.tsx` | Replace admin `<ComingSoon>` stubs with real pages |
| `client/src/app/components/Header.tsx` | Add staff-only "Admin" link in desktop nav and mobile overlay |

> **Note:** `LoginPage.tsx` already redirects `is_staff` users to `/admin` at line 28 — no change needed.

---

## Task 1: Backend admin stats endpoint

**Files:**
- Modify: `server/content/views.py`
- Modify: `server/content/urls.py`

- [ ] **Step 1: Write the failing test**

Add to `server/content/tests.py`:

```python
from django.contrib.auth.models import User
from django.test import TestCase
from rest_framework.test import APIClient
from .models import BookingRequest, EditingRequest, PortfolioItem


class AdminStatsTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.staff = User.objects.create_user(
            username='kay@test.com', password='pass', is_staff=True
        )
        self.customer = User.objects.create_user(
            username='alice@test.com', password='pass'
        )

    def test_stats_requires_staff(self):
        self.client.force_authenticate(user=self.customer)
        res = self.client.get('/api/admin/stats/')
        self.assertEqual(res.status_code, 403)

    def test_stats_returns_counts(self):
        self.client.force_authenticate(user=self.staff)
        BookingRequest.objects.create(
            customer=self.customer, session_type='wedding',
            location='Oxford', postcode='OX1 1AA', status='pending'
        )
        res = self.client.get('/api/admin/stats/')
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn('pending_bookings', data)
        self.assertIn('active_editing', data)
        self.assertIn('portfolio_items', data)
        self.assertIn('recent_bookings', data)
        self.assertIn('recent_editing', data)
        self.assertEqual(data['pending_bookings'], 1)
```

- [ ] **Step 2: Run the test to verify it fails**

```
cd server
venv/Scripts/python -m pytest content/tests.py::AdminStatsTest -v
```
Expected: FAIL — `admin_stats` view not yet defined.

- [ ] **Step 3: Add the view to `server/content/views.py`**

Append after the `portfolio_list` view:

```python
from rest_framework.permissions import IsAdminUser


@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_stats(request):
    pending_bookings = BookingRequest.objects.filter(status='pending').count()
    active_editing = EditingRequest.objects.filter(
        status__in=['requested', 'confirmed', 'in_progress']
    ).count()
    portfolio_items = PortfolioItem.objects.count()

    recent_bookings = []
    for b in BookingRequest.objects.order_by('-created_at')[:5]:
        recent_bookings.append({
            'id': b.id,
            'customer_email': b.customer.email,
            'session_type': b.session_type,
            'status': b.status,
            'created_at': b.created_at.isoformat(),
        })

    recent_editing = []
    for e in EditingRequest.objects.order_by('-created_at')[:5]:
        recent_editing.append({
            'id': e.id,
            'customer_email': e.customer.email,
            'turnaround': e.turnaround,
            'status': e.status,
            'created_at': e.created_at.isoformat(),
        })

    return Response({
        'pending_bookings': pending_bookings,
        'active_editing': active_editing,
        'portfolio_items': portfolio_items,
        'recent_bookings': recent_bookings,
        'recent_editing': recent_editing,
    })
```

Also add `EditingRequest` to the import at the top of the file:

```python
from .models import ServiceArea, PortfolioItem, BookingRequest, EditingRequest
```

- [ ] **Step 4: Register the URL in `server/content/urls.py`**

```python
from django.urls import path
from . import views

urlpatterns = [
    path('service-area/', views.service_area_detail),
    path('service-area/check/', views.service_area_check),
    path('portfolio/', views.portfolio_list),
    path('admin/stats/', views.admin_stats),
]
```

- [ ] **Step 5: Run the test to verify it passes**

```
cd server
venv/Scripts/python -m pytest content/tests.py::AdminStatsTest -v
```
Expected: PASS (2 tests).

- [ ] **Step 6: Commit**

```bash
git add server/content/views.py server/content/urls.py server/content/tests.py
git commit -m "feat: add admin stats endpoint"
```

---

## Task 2: Backend admin bookings endpoints

**Files:**
- Modify: `server/content/views.py`
- Modify: `server/content/urls.py`

- [ ] **Step 1: Write the failing tests**

Append to `server/content/tests.py`:

```python
class AdminBookingsTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.staff = User.objects.create_user(
            username='kay@test.com', password='pass', is_staff=True
        )
        self.customer = User.objects.create_user(
            username='alice@test.com', password='pass'
        )
        self.booking = BookingRequest.objects.create(
            customer=self.customer, session_type='portrait',
            location='Oxford', postcode='OX1 1AA', status='pending'
        )

    def test_list_requires_staff(self):
        self.client.force_authenticate(user=self.customer)
        res = self.client.get('/api/admin/bookings/')
        self.assertEqual(res.status_code, 403)

    def test_list_all(self):
        self.client.force_authenticate(user=self.staff)
        res = self.client.get('/api/admin/bookings/')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(len(res.json()), 1)

    def test_list_filter_by_status(self):
        self.client.force_authenticate(user=self.staff)
        res = self.client.get('/api/admin/bookings/?status=confirmed')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(len(res.json()), 0)

    def test_patch_status(self):
        self.client.force_authenticate(user=self.staff)
        res = self.client.patch(
            f'/api/admin/bookings/{self.booking.id}/status/',
            {'status': 'confirmed'}, format='json'
        )
        self.assertEqual(res.status_code, 200)
        self.booking.refresh_from_db()
        self.assertEqual(self.booking.status, 'confirmed')

    def test_patch_status_invalid(self):
        self.client.force_authenticate(user=self.staff)
        res = self.client.patch(
            f'/api/admin/bookings/{self.booking.id}/status/',
            {'status': 'invalid'}, format='json'
        )
        self.assertEqual(res.status_code, 400)

    def test_post_message(self):
        self.client.force_authenticate(user=self.staff)
        res = self.client.post(
            f'/api/admin/bookings/{self.booking.id}/message/',
            {'body': 'Hello!'}, format='json'
        )
        self.assertEqual(res.status_code, 201)
```

- [ ] **Step 2: Run tests to verify they fail**

```
cd server
venv/Scripts/python -m pytest content/tests.py::AdminBookingsTest -v
```
Expected: FAIL — views not yet defined.

- [ ] **Step 3: Add the three booking views to `server/content/views.py`**

Also add `Message` to the imports at the top:

```python
from .models import ServiceArea, PortfolioItem, BookingRequest, EditingRequest, Message
```

Append after `admin_stats`:

```python
VALID_BOOKING_STATUSES = {'pending', 'confirmed', 'declined', 'cancelled', 'completed'}


@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_bookings_list(request):
    qs = BookingRequest.objects.select_related('customer').order_by('-created_at')
    status = request.query_params.get('status')
    if status:
        qs = qs.filter(status=status)
    result = []
    for b in qs:
        result.append({
            'id': b.id,
            'customer_email': b.customer.email,
            'session_type': b.session_type,
            'location': b.location,
            'date': b.slot.date.isoformat() if b.slot else None,
            'status': b.status,
            'created_at': b.created_at.isoformat(),
        })
    return Response(result)


@api_view(['PATCH'])
@permission_classes([IsAdminUser])
def admin_booking_status(request, pk):
    try:
        booking = BookingRequest.objects.get(pk=pk)
    except BookingRequest.DoesNotExist:
        return Response({'error': 'Not found.'}, status=404)
    new_status = request.data.get('status')
    if new_status not in VALID_BOOKING_STATUSES:
        return Response({'error': f'Invalid status: {new_status}'}, status=400)
    booking.status = new_status
    booking.save()
    return Response({'id': booking.id, 'status': booking.status})


@api_view(['POST'])
@permission_classes([IsAdminUser])
def admin_booking_message(request, pk):
    try:
        BookingRequest.objects.get(pk=pk)
    except BookingRequest.DoesNotExist:
        return Response({'error': 'Not found.'}, status=404)
    body = request.data.get('body', '').strip()
    if not body:
        return Response({'error': 'body is required.'}, status=400)
    Message.objects.create(
        thread_type='booking',
        thread_id=pk,
        sender=request.user,
        body=body,
    )
    return Response({'ok': True}, status=201)
```

- [ ] **Step 4: Register booking URLs in `server/content/urls.py`**

```python
from django.urls import path
from . import views

urlpatterns = [
    path('service-area/', views.service_area_detail),
    path('service-area/check/', views.service_area_check),
    path('portfolio/', views.portfolio_list),
    path('admin/stats/', views.admin_stats),
    path('admin/bookings/', views.admin_bookings_list),
    path('admin/bookings/<int:pk>/status/', views.admin_booking_status),
    path('admin/bookings/<int:pk>/message/', views.admin_booking_message),
]
```

- [ ] **Step 5: Run tests to verify they pass**

```
cd server
venv/Scripts/python -m pytest content/tests.py::AdminBookingsTest -v
```
Expected: PASS (6 tests).

- [ ] **Step 6: Commit**

```bash
git add server/content/views.py server/content/urls.py server/content/tests.py
git commit -m "feat: add admin bookings endpoints"
```

---

## Task 3: Backend admin editing endpoints

**Files:**
- Modify: `server/content/views.py`
- Modify: `server/content/urls.py`

- [ ] **Step 1: Write the failing tests**

Append to `server/content/tests.py`:

```python
class AdminEditingTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.staff = User.objects.create_user(
            username='kay@test.com', password='pass', is_staff=True
        )
        self.customer = User.objects.create_user(
            username='alice@test.com', password='pass'
        )
        self.editing = EditingRequest.objects.create(
            customer=self.customer,
            style_notes='Warm tones', turnaround='3 days', status='requested'
        )

    def test_list_requires_staff(self):
        self.client.force_authenticate(user=self.customer)
        res = self.client.get('/api/admin/editing-requests/')
        self.assertEqual(res.status_code, 403)

    def test_list_all(self):
        self.client.force_authenticate(user=self.staff)
        res = self.client.get('/api/admin/editing-requests/')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(len(res.json()), 1)

    def test_list_filter_by_status(self):
        self.client.force_authenticate(user=self.staff)
        res = self.client.get('/api/admin/editing-requests/?status=delivered')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(len(res.json()), 0)

    def test_patch_status(self):
        self.client.force_authenticate(user=self.staff)
        res = self.client.patch(
            f'/api/admin/editing-requests/{self.editing.id}/status/',
            {'status': 'confirmed'}, format='json'
        )
        self.assertEqual(res.status_code, 200)
        self.editing.refresh_from_db()
        self.assertEqual(self.editing.status, 'confirmed')

    def test_patch_quoted_price(self):
        self.client.force_authenticate(user=self.staff)
        res = self.client.patch(
            f'/api/admin/editing-requests/{self.editing.id}/status/',
            {'quoted_price': '75.00'}, format='json'
        )
        self.assertEqual(res.status_code, 200)
        self.editing.refresh_from_db()
        self.assertEqual(str(self.editing.quoted_price), '75.00')

    def test_patch_invalid_status(self):
        self.client.force_authenticate(user=self.staff)
        res = self.client.patch(
            f'/api/admin/editing-requests/{self.editing.id}/status/',
            {'status': 'shipped'}, format='json'
        )
        self.assertEqual(res.status_code, 400)

    def test_post_message(self):
        self.client.force_authenticate(user=self.staff)
        res = self.client.post(
            f'/api/admin/editing-requests/{self.editing.id}/message/',
            {'body': 'Your edit is ready.'}, format='json'
        )
        self.assertEqual(res.status_code, 201)
```

- [ ] **Step 2: Run tests to verify they fail**

```
cd server
venv/Scripts/python -m pytest content/tests.py::AdminEditingTest -v
```
Expected: FAIL — editing views not yet defined.

- [ ] **Step 3: Add the three editing views to `server/content/views.py`**

Append after `admin_booking_message`:

```python
VALID_EDITING_STATUSES = {'requested', 'confirmed', 'in_progress', 'delivered', 'declined'}


@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_editing_list(request):
    qs = EditingRequest.objects.select_related('customer').order_by('-created_at')
    status = request.query_params.get('status')
    if status:
        qs = qs.filter(status=status)
    result = []
    for e in qs:
        result.append({
            'id': e.id,
            'customer_email': e.customer.email,
            'style_notes': e.style_notes,
            'turnaround': e.turnaround,
            'quoted_price': str(e.quoted_price) if e.quoted_price is not None else None,
            'status': e.status,
            'created_at': e.created_at.isoformat(),
        })
    return Response(result)


@api_view(['PATCH'])
@permission_classes([IsAdminUser])
def admin_editing_status(request, pk):
    try:
        editing = EditingRequest.objects.get(pk=pk)
    except EditingRequest.DoesNotExist:
        return Response({'error': 'Not found.'}, status=404)

    new_status = request.data.get('status')
    if new_status is not None:
        if new_status not in VALID_EDITING_STATUSES:
            return Response({'error': f'Invalid status: {new_status}'}, status=400)
        editing.status = new_status

    quoted_price = request.data.get('quoted_price')
    if quoted_price is not None:
        try:
            editing.quoted_price = float(quoted_price)
        except (ValueError, TypeError):
            return Response({'error': 'quoted_price must be a number.'}, status=400)

    editing.save()
    return Response({
        'id': editing.id,
        'status': editing.status,
        'quoted_price': str(editing.quoted_price) if editing.quoted_price is not None else None,
    })


@api_view(['POST'])
@permission_classes([IsAdminUser])
def admin_editing_message(request, pk):
    try:
        EditingRequest.objects.get(pk=pk)
    except EditingRequest.DoesNotExist:
        return Response({'error': 'Not found.'}, status=404)
    body = request.data.get('body', '').strip()
    if not body:
        return Response({'error': 'body is required.'}, status=400)
    Message.objects.create(
        thread_type='editing',
        thread_id=pk,
        sender=request.user,
        body=body,
    )
    return Response({'ok': True}, status=201)
```

- [ ] **Step 4: Register editing URLs in `server/content/urls.py`**

```python
from django.urls import path
from . import views

urlpatterns = [
    path('service-area/', views.service_area_detail),
    path('service-area/check/', views.service_area_check),
    path('portfolio/', views.portfolio_list),
    path('admin/stats/', views.admin_stats),
    path('admin/bookings/', views.admin_bookings_list),
    path('admin/bookings/<int:pk>/status/', views.admin_booking_status),
    path('admin/bookings/<int:pk>/message/', views.admin_booking_message),
    path('admin/editing-requests/', views.admin_editing_list),
    path('admin/editing-requests/<int:pk>/status/', views.admin_editing_status),
    path('admin/editing-requests/<int:pk>/message/', views.admin_editing_message),
]
```

- [ ] **Step 5: Run tests to verify they pass**

```
cd server
venv/Scripts/python -m pytest content/tests.py::AdminEditingTest -v
```
Expected: PASS (7 tests). Run all tests together to confirm no regressions:

```
cd server
venv/Scripts/python -m pytest content/tests.py -v
```

- [ ] **Step 6: Commit**

```bash
git add server/content/views.py server/content/urls.py server/content/tests.py
git commit -m "feat: add admin editing-requests endpoints"
```

---

## Task 4: AdminLayout component

**Files:**
- Create: `client/src/app/components/admin/AdminLayout.tsx`

- [ ] **Step 1: Create the file**

```bash
# Make sure the directory exists (it already does — ServiceAreaEditor.tsx is there)
ls client/src/app/components/admin/
```

- [ ] **Step 2: Write `client/src/app/components/admin/AdminLayout.tsx`**

```tsx
import { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

type AdminTab = 'dashboard' | 'bookings' | 'editing' | 'service-area';

interface Props {
  children: ReactNode;
  activeTab: AdminTab;
}

const TABS: { label: string; tab: AdminTab; path: string }[] = [
  { label: 'Dashboard',    tab: 'dashboard',    path: '/admin' },
  { label: 'Bookings',     tab: 'bookings',     path: '/admin/bookings' },
  { label: 'Editing',      tab: 'editing',      path: '/admin/editing' },
  { label: 'Service Area', tab: 'service-area', path: '/admin/service-area' },
];

const FONT = "'Helvetica Neue', Arial, sans-serif";

export function AdminLayout({ children, activeTab }: Props) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div style={{ minHeight: '100vh', background: '#fafafa', fontFamily: FONT }}>
      {/* Top bar */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 1000,
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(0,0,0,0.08)',
        height: 64,
        display: 'flex', alignItems: 'center',
        padding: '0 32px',
        gap: 32,
      }}>
        {/* Left: admin label + back link */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <span style={{
            fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#888',
          }}>
            Admin
          </span>
          <Link to="/" style={{
            fontSize: 11, letterSpacing: '0.08em', color: '#888',
            textDecoration: 'none', transition: 'color 0.2s',
          }}
            onMouseEnter={e => (e.currentTarget.style.color = '#111')}
            onMouseLeave={e => (e.currentTarget.style.color = '#888')}
          >
            ← Back to site
          </Link>
        </div>

        {/* Tab links */}
        <nav style={{ display: 'flex', gap: 24, flex: 1 }}>
          {TABS.map(({ label, tab, path }) => (
            <Link
              key={tab}
              to={path}
              style={{
                fontSize: 12, letterSpacing: '0.06em', textDecoration: 'none',
                color: activeTab === tab ? '#111' : '#888',
                borderBottom: activeTab === tab ? '1px solid #111' : '1px solid transparent',
                paddingBottom: 2,
                transition: 'color 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = '#111')}
              onMouseLeave={e => {
                if (activeTab !== tab) e.currentTarget.style.color = '#888';
              }}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Log out */}
        <button
          onClick={handleLogout}
          style={{
            background: 'none', border: 'none', padding: 0,
            fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase',
            color: '#888', cursor: 'pointer', transition: 'color 0.2s', flexShrink: 0,
          }}
          onMouseEnter={e => (e.currentTarget.style.color = '#111')}
          onMouseLeave={e => (e.currentTarget.style.color = '#888')}
        >
          Log Out
        </button>
      </div>

      {/* Content area */}
      <div style={{
        maxWidth: 1100, margin: '0 auto',
        padding: '40px 32px',
      }}>
        {children}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd client
npx tsc --noEmit
```
Expected: no errors relating to `AdminLayout.tsx`.

- [ ] **Step 4: Commit**

```bash
git add client/src/app/components/admin/AdminLayout.tsx
git commit -m "feat: add AdminLayout shell component"
```

---

## Task 5: AdminDashboard page

**Files:**
- Create: `client/src/app/pages/admin/AdminDashboard.tsx`

- [ ] **Step 1: Create the directory and file**

```bash
mkdir -p client/src/app/pages/admin
```

- [ ] **Step 2: Write `client/src/app/pages/admin/AdminDashboard.tsx`**

```tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { api } from '../../lib/api';

const FONT = "'Helvetica Neue', Arial, sans-serif";

interface StatsData {
  pending_bookings: number;
  active_editing: number;
  portfolio_items: number;
  recent_bookings: { id: number; customer_email: string; session_type: string; status: string }[];
  recent_editing:  { id: number; customer_email: string; turnaround: string; status: string }[];
}

const STATUS_BADGE: Record<string, { bg: string; color: string }> = {
  pending:     { bg: '#fef3c7', color: '#92400e' },
  confirmed:   { bg: '#d1fae5', color: '#065f46' },
  declined:    { bg: '#fee2e2', color: '#991b1b' },
  completed:   { bg: '#f3f4f6', color: '#374151' },
  cancelled:   { bg: '#f3f4f6', color: '#374151' },
  requested:   { bg: '#fef3c7', color: '#92400e' },
  in_progress: { bg: '#dbeafe', color: '#1e40af' },
  delivered:   { bg: '#d1fae5', color: '#065f46' },
};

function Badge({ status }: { status: string }) {
  const s = STATUS_BADGE[status] ?? { bg: '#f3f4f6', color: '#374151' };
  return (
    <span style={{
      background: s.bg, color: s.color,
      padding: '2px 8px', borderRadius: 3,
      fontSize: 11, fontFamily: FONT,
      textTransform: 'capitalize',
    }}>
      {status.replace('_', ' ')}
    </span>
  );
}

export function AdminDashboard() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.get<StatsData>('/admin/stats/')
      .then(setStats)
      .catch(() => setError('Failed to load stats.'));
  }, []);

  const statCards = stats ? [
    { label: 'Pending Bookings', value: stats.pending_bookings },
    { label: 'Active Editing',   value: stats.active_editing },
    { label: 'Portfolio Items',  value: stats.portfolio_items },
  ] : [];

  return (
    <AdminLayout activeTab="dashboard">
      <h1 style={{ fontSize: 22, fontWeight: 300, letterSpacing: '-0.3px', marginBottom: 32, color: '#111' }}>
        Dashboard
      </h1>

      {error && (
        <p style={{ color: '#b91c1c', fontSize: 13, marginBottom: 24 }}>{error}</p>
      )}

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 48 }}>
        {stats === null && !error
          ? [0, 1, 2].map(i => (
              <div key={i} style={{ background: '#fff', border: '1px solid #eee', padding: '28px 24px' }}>
                <div style={{ width: 60, height: 48, background: '#f3f3f3', borderRadius: 2 }} />
              </div>
            ))
          : statCards.map(({ label, value }) => (
              <div key={label} style={{ background: '#fff', border: '1px solid #eee', padding: '28px 24px' }}>
                <div style={{ fontSize: 48, fontWeight: 300, color: '#111', lineHeight: 1 }}>{value}</div>
                <div style={{ fontSize: 12, color: '#888', marginTop: 8, letterSpacing: '0.04em' }}>{label}</div>
              </div>
            ))
        }
      </div>

      {/* Recent activity */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
          {/* Recent Bookings */}
          <div>
            <h2 style={{ fontSize: 13, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#888', marginBottom: 12 }}>
              Recent Bookings
            </h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #eee' }}>
                  {['Customer', 'Type', 'Status'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '6px 8px', color: '#888', fontWeight: 400, fontSize: 11, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stats.recent_bookings.length === 0
                  ? <tr><td colSpan={3} style={{ padding: '16px 8px', color: '#aaa', fontSize: 12 }}>No bookings yet</td></tr>
                  : stats.recent_bookings.map(b => (
                      <tr
                        key={b.id}
                        onClick={() => navigate('/admin/bookings')}
                        style={{ borderBottom: '1px solid #f3f3f3', cursor: 'pointer' }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#fafafa')}
                        onMouseLeave={e => (e.currentTarget.style.background = '')}
                      >
                        <td style={{ padding: '8px 8px', color: '#333' }}>{b.customer_email}</td>
                        <td style={{ padding: '8px 8px', color: '#555', textTransform: 'capitalize' }}>{b.session_type}</td>
                        <td style={{ padding: '8px 8px' }}><Badge status={b.status} /></td>
                      </tr>
                    ))
                }
              </tbody>
            </table>
          </div>

          {/* Recent Editing */}
          <div>
            <h2 style={{ fontSize: 13, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#888', marginBottom: 12 }}>
              Recent Editing
            </h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #eee' }}>
                  {['Customer', 'Turnaround', 'Status'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '6px 8px', color: '#888', fontWeight: 400, fontSize: 11, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stats.recent_editing.length === 0
                  ? <tr><td colSpan={3} style={{ padding: '16px 8px', color: '#aaa', fontSize: 12 }}>No editing requests yet</td></tr>
                  : stats.recent_editing.map(e => (
                      <tr
                        key={e.id}
                        onClick={() => navigate('/admin/editing')}
                        style={{ borderBottom: '1px solid #f3f3f3', cursor: 'pointer' }}
                        onMouseEnter={el => (el.currentTarget.style.background = '#fafafa')}
                        onMouseLeave={el => (el.currentTarget.style.background = '')}
                      >
                        <td style={{ padding: '8px 8px', color: '#333' }}>{e.customer_email}</td>
                        <td style={{ padding: '8px 8px', color: '#555' }}>{e.turnaround}</td>
                        <td style={{ padding: '8px 8px' }}><Badge status={e.status} /></td>
                      </tr>
                    ))
                }
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd client
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add client/src/app/pages/admin/AdminDashboard.tsx
git commit -m "feat: add AdminDashboard page"
```

---

## Task 6: AdminBookings page

**Files:**
- Create: `client/src/app/pages/admin/AdminBookings.tsx`

- [ ] **Step 1: Write `client/src/app/pages/admin/AdminBookings.tsx`**

```tsx
import { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { api } from '../../lib/api';

const FONT = "'Helvetica Neue', Arial, sans-serif";

interface Booking {
  id: number;
  customer_email: string;
  session_type: string;
  location: string;
  date: string | null;
  status: string;
  created_at: string;
}

const STATUS_BADGE: Record<string, { bg: string; color: string }> = {
  pending:   { bg: '#fef3c7', color: '#92400e' },
  confirmed: { bg: '#d1fae5', color: '#065f46' },
  declined:  { bg: '#fee2e2', color: '#991b1b' },
  completed: { bg: '#f3f4f6', color: '#374151' },
  cancelled: { bg: '#f3f4f6', color: '#374151' },
};

const FILTER_TABS = ['all', 'pending', 'confirmed', 'completed', 'declined'];

function Badge({ status }: { status: string }) {
  const s = STATUS_BADGE[status] ?? { bg: '#f3f4f6', color: '#374151' };
  return (
    <span style={{
      background: s.bg, color: s.color,
      padding: '2px 8px', borderRadius: 3,
      fontSize: 11, fontFamily: FONT, textTransform: 'capitalize',
    }}>
      {status}
    </span>
  );
}

interface MessageModalProps {
  email: string;
  onSend: (body: string) => Promise<void>;
  onClose: () => void;
}

function MessageModal({ email, onSend, onClose }: MessageModalProps) {
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState('');

  const handleSend = async () => {
    if (!body.trim()) return;
    setSending(true);
    setErr('');
    try {
      await onSend(body.trim());
      onClose();
    } catch {
      setErr('Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 3000,
      background: 'rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: '#fff', width: '100%', maxWidth: 480,
        padding: '32px', fontFamily: FONT,
      }}>
        <h3 style={{ fontSize: 16, fontWeight: 400, marginBottom: 4 }}>
          Message to {email}
        </h3>
        <textarea
          value={body}
          onChange={e => setBody(e.target.value)}
          rows={4}
          style={{
            width: '100%', padding: '10px 12px',
            border: '1px solid #ddd', fontSize: 13,
            fontFamily: FONT, resize: 'vertical',
            marginTop: 16, boxSizing: 'border-box',
          }}
        />
        {err && <p style={{ color: '#b91c1c', fontSize: 12, margin: '6px 0 0' }}>{err}</p>}
        <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
          <button
            onClick={handleSend} disabled={sending || !body.trim()}
            style={{
              padding: '10px 24px', background: sending ? '#555' : '#111',
              color: '#fff', border: 'none', fontSize: 12, letterSpacing: '0.06em',
              textTransform: 'uppercase', cursor: sending ? 'default' : 'pointer',
              fontFamily: FONT,
            }}
          >
            {sending ? 'Sending…' : 'Send'}
          </button>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', fontSize: 12, color: '#888',
              cursor: 'pointer', fontFamily: FONT,
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export function AdminBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [messageTarget, setMessageTarget] = useState<Booking | null>(null);

  const fetchBookings = (status: string) => {
    setLoading(true);
    setError('');
    const path = status === 'all' ? '/admin/bookings/' : `/admin/bookings/?status=${status}`;
    api.get<Booking[]>(path)
      .then(data => { setBookings(data); setLoading(false); })
      .catch(() => { setError('Failed to load bookings.'); setLoading(false); });
  };

  useEffect(() => { fetchBookings(activeFilter); }, [activeFilter]);

  const handleStatus = async (id: number, status: string) => {
    await api.patch(`/admin/bookings/${id}/status/`, { status });
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
  };

  const handleMessage = async (id: number, body: string) => {
    await api.post(`/admin/bookings/${id}/message/`, { body });
  };

  return (
    <AdminLayout activeTab="bookings">
      <h1 style={{ fontSize: 22, fontWeight: 300, letterSpacing: '-0.3px', marginBottom: 24, color: '#111' }}>
        Bookings
      </h1>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid #eee', marginBottom: 24 }}>
        {FILTER_TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab)}
            style={{
              padding: '8px 16px', background: 'none', border: 'none',
              borderBottom: activeFilter === tab ? '2px solid #111' : '2px solid transparent',
              color: activeFilter === tab ? '#111' : '#888',
              fontSize: 12, letterSpacing: '0.06em', textTransform: 'capitalize',
              cursor: 'pointer', fontFamily: FONT, marginBottom: -1,
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {error && <p style={{ color: '#b91c1c', fontSize: 13, marginBottom: 16 }}>{error}</p>}

      {loading ? (
        <p style={{ color: '#888', fontSize: 13 }}>Loading…</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #eee' }}>
              {['Customer', 'Session', 'Location', 'Date', 'Status', 'Actions'].map(h => (
                <th key={h} style={{
                  textAlign: 'left', padding: '8px 10px', color: '#888',
                  fontWeight: 400, fontSize: 11, letterSpacing: '0.06em',
                  textTransform: 'uppercase', fontFamily: FONT,
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bookings.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '24px 10px', color: '#aaa', fontSize: 13 }}>
                  No bookings found.
                </td>
              </tr>
            ) : bookings.map(b => (
              <tr key={b.id} style={{ borderBottom: '1px solid #f3f3f3' }}>
                <td style={{ padding: '10px 10px', color: '#333' }}>{b.customer_email}</td>
                <td style={{ padding: '10px 10px', color: '#555', textTransform: 'capitalize' }}>{b.session_type}</td>
                <td style={{ padding: '10px 10px', color: '#555', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {b.location.length > 40 ? b.location.slice(0, 40) + '…' : b.location}
                </td>
                <td style={{ padding: '10px 10px', color: '#555' }}>{b.date ?? '—'}</td>
                <td style={{ padding: '10px 10px' }}><Badge status={b.status} /></td>
                <td style={{ padding: '10px 10px' }}>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    {b.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleStatus(b.id, 'confirmed')}
                          style={{
                            padding: '4px 10px', background: '#111', color: '#fff',
                            border: 'none', fontSize: 11, cursor: 'pointer',
                            fontFamily: FONT, height: 28,
                          }}
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => handleStatus(b.id, 'declined')}
                          style={{
                            padding: '4px 10px', background: '#fff', color: '#111',
                            border: '1px solid #ddd', fontSize: 11, cursor: 'pointer',
                            fontFamily: FONT, height: 28,
                          }}
                        >
                          Decline
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => setMessageTarget(b)}
                      style={{
                        background: 'none', border: 'none', fontSize: 11,
                        color: '#555', cursor: 'pointer', fontFamily: FONT,
                        textDecoration: 'underline', padding: 0,
                      }}
                    >
                      Message
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {messageTarget && (
        <MessageModal
          email={messageTarget.customer_email}
          onSend={body => handleMessage(messageTarget.id, body)}
          onClose={() => setMessageTarget(null)}
        />
      )}
    </AdminLayout>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd client
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add client/src/app/pages/admin/AdminBookings.tsx
git commit -m "feat: add AdminBookings page"
```

---

## Task 7: AdminEditing page

**Files:**
- Create: `client/src/app/pages/admin/AdminEditing.tsx`

- [ ] **Step 1: Write `client/src/app/pages/admin/AdminEditing.tsx`**

```tsx
import { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { api } from '../../lib/api';

const FONT = "'Helvetica Neue', Arial, sans-serif";

interface EditingRequest {
  id: number;
  customer_email: string;
  style_notes: string;
  turnaround: string;
  quoted_price: string | null;
  status: string;
  created_at: string;
}

const STATUS_BADGE: Record<string, { bg: string; color: string }> = {
  requested:   { bg: '#fef3c7', color: '#92400e' },
  confirmed:   { bg: '#d1fae5', color: '#065f46' },
  in_progress: { bg: '#dbeafe', color: '#1e40af' },
  delivered:   { bg: '#d1fae5', color: '#065f46' },
  declined:    { bg: '#fee2e2', color: '#991b1b' },
};

const FILTER_TABS = ['all', 'requested', 'confirmed', 'in_progress', 'delivered', 'declined'];

const STATUS_PROGRESSION: Record<string, string[]> = {
  confirmed:   ['confirmed', 'in_progress', 'delivered'],
  in_progress: ['confirmed', 'in_progress', 'delivered'],
};

function Badge({ status }: { status: string }) {
  const s = STATUS_BADGE[status] ?? { bg: '#f3f4f6', color: '#374151' };
  return (
    <span style={{
      background: s.bg, color: s.color,
      padding: '2px 8px', borderRadius: 3,
      fontSize: 11, fontFamily: FONT, textTransform: 'capitalize',
    }}>
      {status.replace('_', ' ')}
    </span>
  );
}

interface MessageModalProps {
  email: string;
  onSend: (body: string) => Promise<void>;
  onClose: () => void;
}

function MessageModal({ email, onSend, onClose }: MessageModalProps) {
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState('');

  const handleSend = async () => {
    if (!body.trim()) return;
    setSending(true);
    setErr('');
    try {
      await onSend(body.trim());
      onClose();
    } catch {
      setErr('Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 3000,
      background: 'rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: '#fff', width: '100%', maxWidth: 480,
        padding: '32px', fontFamily: FONT,
      }}>
        <h3 style={{ fontSize: 16, fontWeight: 400, marginBottom: 4 }}>
          Message to {email}
        </h3>
        <textarea
          value={body}
          onChange={e => setBody(e.target.value)}
          rows={4}
          style={{
            width: '100%', padding: '10px 12px',
            border: '1px solid #ddd', fontSize: 13,
            fontFamily: FONT, resize: 'vertical',
            marginTop: 16, boxSizing: 'border-box',
          }}
        />
        {err && <p style={{ color: '#b91c1c', fontSize: 12, margin: '6px 0 0' }}>{err}</p>}
        <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
          <button
            onClick={handleSend} disabled={sending || !body.trim()}
            style={{
              padding: '10px 24px', background: sending ? '#555' : '#111',
              color: '#fff', border: 'none', fontSize: 12, letterSpacing: '0.06em',
              textTransform: 'uppercase', cursor: sending ? 'default' : 'pointer',
              fontFamily: FONT,
            }}
          >
            {sending ? 'Sending…' : 'Send'}
          </button>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', fontSize: 12, color: '#888',
              cursor: 'pointer', fontFamily: FONT,
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export function AdminEditing() {
  const [requests, setRequests] = useState<EditingRequest[]>([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [messageTarget, setMessageTarget] = useState<EditingRequest | null>(null);

  const fetchRequests = (status: string) => {
    setLoading(true);
    setError('');
    const path = status === 'all'
      ? '/admin/editing-requests/'
      : `/admin/editing-requests/?status=${status}`;
    api.get<EditingRequest[]>(path)
      .then(data => { setRequests(data); setLoading(false); })
      .catch(() => { setError('Failed to load editing requests.'); setLoading(false); });
  };

  useEffect(() => { fetchRequests(activeFilter); }, [activeFilter]);

  const patchRequest = async (id: number, patch: { status?: string; quoted_price?: string }) => {
    const updated = await api.patch<{ id: number; status: string; quoted_price: string | null }>(
      `/admin/editing-requests/${id}/status/`, patch
    );
    setRequests(prev => prev.map(r =>
      r.id === id
        ? { ...r, status: updated.status, quoted_price: updated.quoted_price }
        : r
    ));
  };

  const handleMessage = async (id: number, body: string) => {
    await api.post(`/admin/editing-requests/${id}/message/`, { body });
  };

  return (
    <AdminLayout activeTab="editing">
      <h1 style={{ fontSize: 22, fontWeight: 300, letterSpacing: '-0.3px', marginBottom: 24, color: '#111' }}>
        Editing Requests
      </h1>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid #eee', marginBottom: 24 }}>
        {FILTER_TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab)}
            style={{
              padding: '8px 16px', background: 'none', border: 'none',
              borderBottom: activeFilter === tab ? '2px solid #111' : '2px solid transparent',
              color: activeFilter === tab ? '#111' : '#888',
              fontSize: 12, letterSpacing: '0.06em', textTransform: 'capitalize',
              cursor: 'pointer', fontFamily: FONT, marginBottom: -1,
            }}
          >
            {tab.replace('_', ' ')}
          </button>
        ))}
      </div>

      {error && <p style={{ color: '#b91c1c', fontSize: 13, marginBottom: 16 }}>{error}</p>}

      {loading ? (
        <p style={{ color: '#888', fontSize: 13 }}>Loading…</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #eee' }}>
              {['Customer', 'Style notes', 'Turnaround', 'Price', 'Status', 'Actions'].map(h => (
                <th key={h} style={{
                  textAlign: 'left', padding: '8px 10px', color: '#888',
                  fontWeight: 400, fontSize: 11, letterSpacing: '0.06em',
                  textTransform: 'uppercase', fontFamily: FONT,
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {requests.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '24px 10px', color: '#aaa', fontSize: 13 }}>
                  No editing requests found.
                </td>
              </tr>
            ) : requests.map(r => (
              <tr key={r.id} style={{ borderBottom: '1px solid #f3f3f3' }}>
                <td style={{ padding: '10px 10px', color: '#333' }}>{r.customer_email}</td>
                <td style={{ padding: '10px 10px', color: '#555', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {r.style_notes.length > 60 ? r.style_notes.slice(0, 60) + '…' : r.style_notes}
                </td>
                <td style={{ padding: '10px 10px', color: '#555' }}>{r.turnaround}</td>
                <td style={{ padding: '10px 10px' }}>
                  <input
                    type="number"
                    defaultValue={r.quoted_price ?? ''}
                    placeholder="—"
                    onBlur={e => {
                      const val = e.target.value.trim();
                      if (val !== (r.quoted_price ?? '')) {
                        patchRequest(r.id, { quoted_price: val || '0' });
                      }
                    }}
                    style={{
                      width: 70, padding: '3px 6px',
                      border: '1px solid #ddd', fontSize: 12,
                      fontFamily: FONT,
                    }}
                  />
                </td>
                <td style={{ padding: '10px 10px' }}><Badge status={r.status} /></td>
                <td style={{ padding: '10px 10px' }}>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    {r.status === 'requested' && (
                      <>
                        <button
                          onClick={() => patchRequest(r.id, { status: 'confirmed' })}
                          style={{
                            padding: '4px 10px', background: '#111', color: '#fff',
                            border: 'none', fontSize: 11, cursor: 'pointer',
                            fontFamily: FONT, height: 28,
                          }}
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => patchRequest(r.id, { status: 'declined' })}
                          style={{
                            padding: '4px 10px', background: '#fff', color: '#111',
                            border: '1px solid #ddd', fontSize: 11, cursor: 'pointer',
                            fontFamily: FONT, height: 28,
                          }}
                        >
                          Decline
                        </button>
                      </>
                    )}
                    {STATUS_PROGRESSION[r.status] && (
                      <select
                        value={r.status}
                        onChange={e => patchRequest(r.id, { status: e.target.value })}
                        style={{
                          padding: '3px 6px', border: '1px solid #ddd',
                          fontSize: 11, fontFamily: FONT, cursor: 'pointer',
                        }}
                      >
                        {STATUS_PROGRESSION[r.status].map(s => (
                          <option key={s} value={s}>{s.replace('_', ' ')}</option>
                        ))}
                      </select>
                    )}
                    <button
                      onClick={() => setMessageTarget(r)}
                      style={{
                        background: 'none', border: 'none', fontSize: 11,
                        color: '#555', cursor: 'pointer', fontFamily: FONT,
                        textDecoration: 'underline', padding: 0,
                      }}
                    >
                      Message
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {messageTarget && (
        <MessageModal
          email={messageTarget.customer_email}
          onSend={body => handleMessage(messageTarget.id, body)}
          onClose={() => setMessageTarget(null)}
        />
      )}
    </AdminLayout>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd client
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add client/src/app/pages/admin/AdminEditing.tsx
git commit -m "feat: add AdminEditing page"
```

---

## Task 8: Wire admin routes in App.tsx

**Files:**
- Modify: `client/src/app/App.tsx`

- [ ] **Step 1: Update `client/src/app/App.tsx`**

Replace the import section and admin routes. The final file should be:

```tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ServiceAreaPage } from './pages/ServiceAreaPage';
import { ServiceAreaEditor } from './components/admin/ServiceAreaEditor';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminBookings } from './pages/admin/AdminBookings';
import { AdminEditing } from './pages/admin/AdminEditing';
import { Cursor } from './components/Cursor';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Portfolio } from './components/Portfolio';
import { Services } from './components/Services';
import { About } from './components/About';
import { Footer } from './components/Footer';

function HomePage() {
  return (
    <div style={{ minHeight: '100vh' }}>
      <Header />
      <main>
        <Hero />
        <Portfolio />
        <Services />
        <About />
      </main>
      <Footer />
    </div>
  );
}

function ComingSoon({ label }: { label: string }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ fontSize: 14, color: '#888', fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>
        {label} — coming soon
      </p>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Cursor />
        <Routes>
          {/* Public */}
          <Route path="/"            element={<HomePage />} />
          <Route path="/login"       element={<LoginPage />} />
          <Route path="/register"    element={<RegisterPage />} />
          <Route path="/service-area" element={<ServiceAreaPage />} />

          {/* Customer (login required) */}
          <Route path="/book"      element={<ProtectedRoute><ComingSoon label="Book a Session" /></ProtectedRoute>} />
          <Route path="/editing"   element={<ProtectedRoute><ComingSoon label="Photo Editing" /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><ComingSoon label="Dashboard" /></ProtectedRoute>} />
          <Route path="/messages"  element={<ProtectedRoute><ComingSoon label="Messages" /></ProtectedRoute>} />

          {/* Admin routes */}
          <Route path="/admin" element={
            <ProtectedRoute requireStaff><AdminDashboard /></ProtectedRoute>
          } />
          <Route path="/admin/bookings" element={
            <ProtectedRoute requireStaff><AdminBookings /></ProtectedRoute>
          } />
          <Route path="/admin/editing" element={
            <ProtectedRoute requireStaff><AdminEditing /></ProtectedRoute>
          } />
          <Route path="/admin/service-area" element={
            <ProtectedRoute requireStaff>
              <div style={{ padding: '80px 48px' }}>
                <ServiceAreaEditor />
              </div>
            </ProtectedRoute>
          } />
          <Route path="/admin/*" element={
            <ProtectedRoute requireStaff>
              <ComingSoon label="Admin" />
            </ProtectedRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles and Vite builds**

```bash
cd client
npx tsc --noEmit && npm run build
```
Expected: no errors, build output in `dist/`.

- [ ] **Step 3: Commit**

```bash
git add client/src/app/App.tsx
git commit -m "feat: wire admin routes to new pages"
```

---

## Task 9: Add Admin link to Header

**Files:**
- Modify: `client/src/app/components/Header.tsx`

- [ ] **Step 1: Add "Admin" link to the desktop nav in `Header.tsx`**

In the desktop nav section (after the `Area` link, around line 135), add:

```tsx
{user?.is_staff && (
  <Link
    to="/admin"
    style={{
      fontFamily: "'Helvetica Neue', Arial, sans-serif",
      fontSize: 12, fontWeight: 400, letterSpacing: '0.08em',
      textTransform: 'uppercase', color: '#111',
      textDecoration: 'none', transition: 'color 0.2s',
    }}
  >
    Admin
  </Link>
)}
```

- [ ] **Step 2: Add "Admin" link to the mobile overlay nav**

In the mobile overlay `<nav>` section (after the `Area` link, around line 262), add:

```tsx
{user?.is_staff && (
  <Link
    to="/admin"
    onClick={closeMenu}
    style={{
      fontSize: 'clamp(28px, 8vw, 40px)', fontWeight: 300,
      letterSpacing: '-0.01em', color: '#111',
      textDecoration: 'none',
      fontFamily: "'Helvetica Neue', Arial, sans-serif",
    }}
  >
    Admin
  </Link>
)}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd client
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 4: Final build check**

```bash
cd client
npm run build
```
Expected: clean build.

- [ ] **Step 5: Commit**

```bash
git add client/src/app/components/Header.tsx
git commit -m "feat: add staff-only Admin link to header"
```

---

## Manual Smoke Test

After all tasks are complete, do a quick end-to-end check:

1. Start Django: `cd server && venv/Scripts/python manage.py runserver`
2. Start Vite: `cd client && npm run dev`
3. Make Kay a staff user if not already:
   ```bash
   cd server
   venv/Scripts/python manage.py shell -c "
   from django.contrib.auth.models import User
   u = User.objects.get(username='kay@kaytubillla.com')
   u.is_staff = True
   u.save()
   print('Done')"
   ```
4. Log in as Kay → should auto-redirect to `/admin`
5. Check that header shows "Admin" link (desktop and mobile)
6. Visit `/admin` → Dashboard loads with stat cards
7. Visit `/admin/bookings` → table loads, filter tabs work
8. Visit `/admin/editing` → table loads, filter tabs work
9. Log in as a regular customer → should NOT see Admin link, navigating to `/admin` should redirect to `/dashboard`

---

## Self-Review

**Spec coverage check:**
- ✅ Section 1 (Access): auto-redirect already in LoginPage; header Admin link in Task 9; route gate already in ProtectedRoute; no change needed
- ✅ Section 2 (AdminLayout): Task 4
- ✅ Section 3 (Dashboard stats + recent tables): Task 5
- ✅ Section 4 (Bookings list, confirm/decline, message): Tasks 2 + 6
- ✅ Section 5 (Editing list, status select, inline price, message): Tasks 3 + 7
- ✅ Section 6 (File map): all files accounted for in Tasks 1–9
- ✅ Section 7 (Out of scope): portfolio/availability not included

**All backend endpoints covered:**
- `GET /api/admin/stats/` ✅
- `GET /api/admin/bookings/` ✅
- `PATCH /api/admin/bookings/{id}/status/` ✅
- `POST /api/admin/bookings/{id}/message/` ✅
- `GET /api/admin/editing-requests/` ✅
- `PATCH /api/admin/editing-requests/{id}/status/` ✅
- `POST /api/admin/editing-requests/{id}/message/` ✅
