# Kay Tubillla Photography — Design Spec

**Date:** 2026-04-01  
**Stack:** React + Vite (frontend) · Django + DRF (backend)  
**Status:** Approved — ready for implementation planning

---

## 1. Overview

A professional photography business website for Kay Tubillla, based in Oxford. The site serves three goals:

1. **Impress** — portfolio showcase as the primary homepage experience
2. **Book** — customers book photography sessions with Kay
3. **Edit** — customers submit photos for professional editing

---

## 2. Visual Identity

- **Style:** Clean & Modern / Monochrome — white backgrounds, stark black typography, minimal colour accents
- **Typography:** Helvetica Neue / Arial, thin/light weights for headings, clear hierarchy
- **Animation library:** GSAP + ScrollTrigger (replaces/supplements existing Framer Motion)
- **Custom cursor:** Small dot with trailing ring (desktop only)
- **Interactions:**
  - Hero: 4-photo slideshow, crossfade every 4 seconds, GSAP scale transition, dot indicators
  - Scroll-triggered reveals: text line-clip reveals, staggered grid entries, parallax on hero background
  - Hover: image scale-down on portfolio grid, arrow slide on service links
  - Section titles: masked line reveal on scroll entry

---

## 3. Site Structure

### 3.1 Public pages (no login required)

| Route | Description |
|---|---|
| `/` | Scrolling home page (see §4) |
| `/login` | Customer login |
| `/register` | Customer registration |

### 3.2 Customer pages (login required)

| Route | Description |
|---|---|
| `/book` | Book a photography session |
| `/editing` | Submit photos for editing |
| `/dashboard` | View all bookings, editing jobs, pending payments |
| `/messages` | Messaging threads with Kay |

### 3.3 Admin pages (Kay only — staff user)

> Note: Django's built-in admin panel must be remounted at `/django-admin/` to avoid conflicting with the custom React admin at `/admin/*`.

| Route | Description |
|---|---|
| `/admin` | Admin dashboard overview |
| `/admin/availability` | Manage available calendar slots |
| `/admin/bookings` | View, confirm/decline, reply to booking requests |
| `/admin/editing` | View editing submissions, set price, update status, reply |
| `/admin/portfolio` | Upload, reorder, feature, or delete portfolio images |

---

## 4. Homepage (Scrolling)

Sections in order:

1. **Nav** — frosted white bar, always visible. Left-centre: scroll links (Portfolio, Services, About, Contact). Right: Book · Editing · divider · Log In (outlined) · Register (filled black)
2. **Hero** — full-viewport slideshow (4 photos, 4s interval, crossfade + scale). Text: eyebrow "Oxford · Photography", name "Kay Tubillla", tagline, two CTAs (Book a Session / Submit for Editing). Slide dot indicators bottom-right. Scroll hint bottom-left.
3. **Portfolio** — section label, title reveal, category filter row (All / Wedding / Portrait / Event / Landscape / Product), 3-column grid of images loaded from API. Images stagger in on scroll, scale-down on hover.
4. **Services** — two cards side by side. Left (light grey): Photography Sessions. Right (black): Photo Editing. Each has a number, title, description, and animated arrow link.
5. **About** — two-column: photo of Kay left, text right (eyebrow, name reveal, rule line draw, bio paragraph).
6. **Footer** — black bar with name, email, copyright.

---

## 5. Booking Flow

1. Customer logs in, navigates to `/book`
2. Selects session type (Wedding / Portrait / Event / Landscape / Product)
3. Enters shoot location → **service area check**:
   - If postcode matches Oxford service zone → home visit confirmed
   - If outside zone → shown message: studio visit required, Kay's studio address displayed
4. Calendar shows only Kay's available slots (from `AvailabilitySlot` model)
5. Customer selects slot, adds notes, submits request
6. Status set to `pending` — slot is **soft-held** (not yet locked)
7. Kay reviews in admin, confirms or declines
8. On confirm: customer receives notification + Stripe payment link
9. Customer pays → Django webhook receives Stripe confirmation → slot status set to `booked`, booking status set to `confirmed`
10. Cancellation by Kay or customer → slot freed, refund policy handled manually for now

---

## 6. Photo Editing Flow

1. Customer logs in, navigates to `/editing`
2. Uploads photos (direct file upload, multiple files supported)
3. Fills in: editing style notes, turnaround expectation
4. Submits → status: `requested`
5. Kay reviews in admin, confirms job and sets quoted price
6. Customer notified → pays via Stripe payment link
7. Kay works on edits, updates status: `in_progress`
8. Kay delivers (uploads edited files or sends link), sets status: `delivered`
9. Customer sees final status in `/dashboard`

---

## 7. Messaging

- Each booking and each editing job has its own message thread
- Customers access threads from `/dashboard` or `/messages`
- Kay accesses threads per job in the admin views
- Simple chronological chat UI — sender, body, timestamp, read indicator
- No real-time (WebSocket) in v1 — page refresh or polling sufficient

---

## 8. Kay's Admin Section

Built as custom branded React pages behind `/admin/*`. Kay logs in with her Django staff account.

### Availability Manager
- Calendar view (month grid)
- Kay clicks days to add available time slots (start/end time per slot)
- Existing bookings shown as locked (greyed)
- Can cancel a booked slot (triggers notification to customer)

### Bookings Manager
- List of all booking requests with status badges
- Click to expand: customer details, session type, location, slot, notes
- Actions: Confirm / Decline / Reply (opens message thread)
- Shows payment status per booking

### Editing Manager
- List of all editing submissions with status badges
- Click to expand: uploaded files preview, style notes, turnaround request
- Actions: Set price + Confirm / Decline / Update status / Reply
- Shows payment status per job

### Portfolio Manager
- Grid of current portfolio images
- Upload new images (with category, title, featured flag)
- Drag to reorder (order field)
- Delete with confirmation

---

## 9. Authentication

| User type | How they log in | How account is created |
|---|---|---|
| Customer | Email + password at `/login` | Self-register at `/register` |
| Kay | Email + password at `/login` | Manually via Django shell / admin |

- Backend: Django session auth + `djangorestframework-simplejwt` for API token auth
- Protected routes on the frontend redirect to `/login` if not authenticated
- Kay's admin routes additionally check `is_staff` flag — redirect to home if not

---

## 10. Payments

- Provider: **Stripe**
- Flow: confirm-first, pay-later (Kay confirms, then customer is sent a payment link)
- Django receives Stripe webhook at `POST /api/payments/webhook/` to confirm payment and update statuses
- No refund automation in v1 — handled manually by Kay

---

## 11. Service Area

- Validation is postcode-based
- Placeholder for v1: accepted prefixes stored in Django setting `SERVICE_AREA_POSTCODES` (e.g. `["OX1","OX2","OX3","OX4"]`)
- Kay to define the exact boundary later — easy to update the setting without code changes
- Frontend displays the result clearly: "Great, Kay can come to you" or "You're outside Kay's travel zone — sessions take place at her Oxford studio"

---

## 12. Data Models

```
PortfolioItem
  title          str
  category       str (Wedding | Portrait | Event | Landscape | Product)
  image          ImageField
  featured       bool
  order          int
  created_at     datetime

AvailabilitySlot
  date           date
  start_time     time
  end_time       time
  is_booked      bool  ← set to true when linked booking reaches confirmed status

BookingRequest
  customer       FK → User
  session_type   str
  location       str
  postcode       str
  is_home_visit  bool
  slot           FK → AvailabilitySlot (nullable until selected)
  notes          text
  status         enum: pending | confirmed | declined | cancelled | completed
  created_at     datetime

EditingRequest
  customer       FK → User
  style_notes    text
  turnaround     str
  status         enum: requested | confirmed | in_progress | delivered | declined
  quoted_price   decimal (nullable)
  created_at     datetime

EditingFile
  editing_request  FK → EditingRequest
  file             FileField
  uploaded_at      datetime

Payment
  booking          FK → BookingRequest (nullable)
  editing_request  FK → EditingRequest (nullable)
  stripe_payment_intent_id  str
  amount           decimal
  currency         str (default: GBP)
  status           enum: pending | paid | failed | refunded
  paid_at          datetime (nullable)

Message
  thread_type    str (booking | editing)
  thread_id      int
  sender         FK → User
  body           text
  timestamp      datetime
  is_read        bool
```

---

## 13. API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/portfolio/` | public | List portfolio items |
| GET | `/api/availability/` | public | List available (unbooked) slots |
| POST | `/api/bookings/` | customer | Submit booking request |
| GET | `/api/bookings/mine/` | customer | List own bookings |
| POST | `/api/editing-requests/` | customer | Submit editing request |
| GET | `/api/editing-requests/mine/` | customer | List own editing jobs |
| GET/POST | `/api/messages/` | customer/staff | List or send messages in a thread |
| PATCH | `/api/bookings/{id}/confirm/` | staff | Confirm booking + trigger payment |
| PATCH | `/api/bookings/{id}/decline/` | staff | Decline booking |
| PATCH | `/api/editing-requests/{id}/confirm/` | staff | Set price + confirm |
| PATCH | `/api/editing-requests/{id}/status/` | staff | Update editing status |
| POST | `/api/portfolio/` | staff | Upload portfolio image |
| DELETE | `/api/portfolio/{id}/` | staff | Delete portfolio image |
| PATCH | `/api/portfolio/{id}/` | staff | Update order/featured/category |
| POST | `/api/availability/` | staff | Create availability slot |
| DELETE | `/api/availability/{id}/` | staff | Remove slot |
| POST | `/api/payments/webhook/` | Stripe | Payment confirmation webhook |

---

## 14. Non-Goals (v1)

- No real-time messaging (WebSocket) — polling or refresh is fine
- No automated refund processing
- No multi-photographer support
- No public customer accounts page (no social/profile features)
- No full notification inbox — but basic transactional emails are included in v1: booking confirmed + Stripe payment link sent to customer email via Django's built-in email backend
- No advanced scheduling optimisation

---

## 15. Dependencies to Add

| Package | Purpose |
|---|---|
| `react-router-dom` | Client-side routing |
| `gsap` | Animation engine (ScrollTrigger included) |
| `djangorestframework-simplejwt` | JWT auth for API |
| `stripe` (Python) | Stripe server-side SDK |
| `django-storages` | File storage for portfolio + editing uploads |
| `Pillow` | Django image handling |
