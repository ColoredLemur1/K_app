# Admin Panel Design

**Goal:** A secure, minimal admin interface for Kay (the photographer) to manage incoming booking requests, editing requests, and get a quick dashboard overview — accessible via auto-redirect on login and a staff-only header link.

---

## 1. Access & Security

### How Kay reaches the admin

**Auto-redirect on login:**
`LoginPage.tsx` already redirects after successful login. Update the redirect logic: if `user.is_staff === true`, navigate to `/admin`; otherwise navigate to `/dashboard` (existing behaviour for customers).

**Staff-only header link:**
In `Header.tsx`, render a small "Admin" link in both the desktop nav and the mobile overlay — but only when `user.is_staff === true`. Invisible to all other users.

**Route gate (already in place):**
All `/admin/*` routes are wrapped in `<ProtectedRoute requireStaff>`. Non-staff users who type `/admin` directly are redirected to `/dashboard`. No change needed here.

**Making Kay a staff user (one-time setup):**
```bash
cd server
venv/Scripts/python manage.py shell
# In the shell:
from django.contrib.auth.models import User
u = User.objects.get(username='kay@kaytubillla.com')  # Kay's registered email
u.is_staff = True
u.save()
```

### Backend API security
Every admin endpoint uses a shared `IsAdminUser` permission class (DRF built-in, requires `is_staff=True`). No endpoint relies solely on frontend gating.

---

## 2. Admin Shell Layout

A new `AdminLayout.tsx` component wraps all admin pages. It renders:

**Top bar** (same frosted-white style as the public header):
- Left: "Admin" label (uppercase, 11px, `#888`) + "← Back to site" link (navigates to `/`)
- Right: tab links — **Dashboard · Bookings · Editing · Service Area**
- Active tab: underlined with a 1px black border-bottom, color `#111`
- Inactive tabs: color `#888`, hover `#111`
- `zIndex: 1000`, `position: sticky, top: 0`

**Content area:**
- `maxWidth: 1100`, `margin: 0 auto`, `padding: 40px 32px`
- `paddingTop: 40px` (below the top bar, which is `64px` tall)
- Font: `'Helvetica Neue', Arial, sans-serif`

**AdminLayout usage pattern:**
Each admin page component renders `<AdminLayout>` as its root element (composition, not route-level wrapping). Example:
```tsx
export function AdminDashboard() {
  return (
    <AdminLayout activeTab="dashboard">
      {/* page content */}
    </AdminLayout>
  );
}
```
`AdminLayout` accepts an `activeTab` prop (`'dashboard' | 'bookings' | 'editing' | 'service-area'`) to highlight the correct tab.

**App.tsx update:**
Replace the three `<ComingSoon>` admin stubs with:
```tsx
<Route path="/admin"          element={<ProtectedRoute requireStaff><AdminDashboard /></ProtectedRoute>} />
<Route path="/admin/bookings" element={<ProtectedRoute requireStaff><AdminBookings /></ProtectedRoute>} />
<Route path="/admin/editing"  element={<ProtectedRoute requireStaff><AdminEditing /></ProtectedRoute>} />
```
`/admin/service-area` stays as-is (already functional).

---

## 3. Dashboard (`/admin`)

**Stat cards row** — three cards:
| Card | Value |
|---|---|
| Pending Bookings | `BookingRequest.objects.filter(status='pending').count()` |
| Active Editing | `EditingRequest.objects.filter(status__in=['requested','confirmed','in_progress']).count()` |
| Portfolio Items | `PortfolioItem.objects.count()` |

Each card: white background, `#111` large number (`fontSize: 48, fontWeight: 300`), label below in `#888`.

**Recent activity** — two side-by-side tables below the cards:
- **Recent Bookings:** last 5 `BookingRequest` ordered by `-created_at`. Columns: customer email, session type, status badge.
- **Recent Editing:** last 5 `EditingRequest` ordered by `-created_at`. Columns: customer email, turnaround, status badge.
- Each row is clickable — navigates to `/admin/bookings` or `/admin/editing`.

**Backend endpoint:**
```
GET /api/admin/stats/
```
Returns:
```json
{
  "pending_bookings": 3,
  "active_editing": 1,
  "portfolio_items": 12,
  "recent_bookings": [ { "id", "customer_email", "session_type", "status", "created_at" } ],
  "recent_editing":  [ { "id", "customer_email", "turnaround", "status", "created_at" } ]
}
```
Permission: `IsAdminUser`

---

## 4. Bookings (`/admin/bookings`)

### Filter tabs
`All · Pending · Confirmed · Completed · Declined`
Active tab shown with black underline. Clicking a tab re-fetches with `?status=` query param.

### Table columns
| Column | Notes |
|---|---|
| Customer | `customer.email` |
| Session type | Capitalised (Wedding, Portrait, etc.) |
| Location | `location` field, truncated to 40 chars |
| Date | `slot.date` if slot assigned, else `—` |
| Status | Colour-coded badge (see below) |
| Actions | Buttons — context-dependent (see below) |

**Status badge colours:**
- `pending` → amber (`#fef3c7` bg, `#92400e` text)
- `confirmed` → green (`#d1fae5` bg, `#065f46` text)
- `declined` → red (`#fee2e2` bg, `#991b1b` text)
- `completed` → grey (`#f3f4f6` bg, `#374151` text)
- `cancelled` → grey

**Actions column:**
- **pending:** `Confirm` (black filled, 28px height) · `Decline` (outlined) · `Message` (text link)
- **all other statuses:** `Message` (text link) only

**Confirm / Decline:**
Clicking sends `PATCH /api/admin/bookings/{id}/status/` with `{ "status": "confirmed" }` or `{ "status": "declined" }`. Row updates in-place (no page reload).

**Message modal:**
Clicking "Message" opens a centred overlay modal:
- Title: "Message to [customer email]"
- `<textarea>` (4 rows, full width)
- `Send` button (black) · `Cancel` (text)
- Submitting sends `POST /api/admin/bookings/{id}/message/` with `{ "body": "..." }`
- On success: modal closes, no visual change to the row

### Backend endpoints
```
GET  /api/admin/bookings/              ?status=pending|confirmed|...
PATCH /api/admin/bookings/{id}/status/ { "status": "confirmed"|"declined" }
POST  /api/admin/bookings/{id}/message/ { "body": "string" }
```
All: `IsAdminUser` permission.

---

## 5. Editing Requests (`/admin/editing`)

### Filter tabs
`All · Requested · Confirmed · In Progress · Delivered · Declined`

### Table columns
| Column | Notes |
|---|---|
| Customer | `customer.email` |
| Style notes | Truncated to 60 chars |
| Turnaround | `turnaround` field |
| Price | Inline editable `<input type="number">`. Saves on blur via `PATCH /api/admin/editing-requests/{id}/status/` with `{ "quoted_price": value }`. Shows `—` if null. |
| Status | Same colour-coded badge system as bookings |
| Actions | Context-dependent (see below) |

**Actions column:**
- **requested:** `Confirm` · `Decline` · `Message`
- **confirmed / in_progress:** Status `<select>` dropdown (`Confirmed → In Progress → Delivered`) · `Message`
- **delivered / declined:** `Message` only

The `<select>` sends `PATCH /api/admin/editing-requests/{id}/status/` on change (no extra button needed).

**Message modal:** identical to Bookings modal — sends `POST /api/admin/editing-requests/{id}/message/`.

### Backend endpoints
```
GET   /api/admin/editing-requests/              ?status=requested|confirmed|...
PATCH /api/admin/editing-requests/{id}/status/  { "status": "...", "quoted_price": optional }
POST  /api/admin/editing-requests/{id}/message/ { "body": "string" }
```
All: `IsAdminUser` permission.

---

## 6. File Map

### Backend — new or modified
| File | Action |
|---|---|
| `server/content/views.py` | Add `admin_stats`, `admin_bookings_list`, `admin_booking_status`, `admin_booking_message`, `admin_editing_list`, `admin_editing_status`, `admin_editing_message` views |
| `server/content/urls.py` | Add `admin/stats/`, `admin/bookings/`, `admin/bookings/{id}/status/`, `admin/bookings/{id}/message/`, `admin/editing-requests/`, `admin/editing-requests/{id}/status/`, `admin/editing-requests/{id}/message/` |

### Frontend — new files
| File | Action |
|---|---|
| `client/src/app/components/admin/AdminLayout.tsx` | Top-tab shell wrapping all admin pages |
| `client/src/app/pages/admin/AdminDashboard.tsx` | Stat cards + recent activity tables |
| `client/src/app/pages/admin/AdminBookings.tsx` | Filterable table, inline confirm/decline, message modal |
| `client/src/app/pages/admin/AdminEditing.tsx` | Filterable table, status select, inline price, message modal |

### Frontend — modified files
| File | Action |
|---|---|
| `client/src/app/App.tsx` | Wire admin routes to new pages |
| `client/src/app/pages/LoginPage.tsx` | Redirect `is_staff` users to `/admin` after login |
| `client/src/app/components/Header.tsx` | Show "Admin" link when `user.is_staff` |

---

## 7. Out of Scope (this phase)

- Portfolio management (add/upload/reorder images) — deferred to a later plan
- Availability slot management — deferred
- Customer-facing message inbox — deferred (customers will see messages in Plan 5)
- Email notifications to customers on confirm/decline
- Pagination on tables (acceptable for now given small expected volume)
