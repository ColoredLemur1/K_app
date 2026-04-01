# CLAUDE.md

## Project Overview

This project is a simple business web app for a photography service.

Core business goals:
- Showcase the lead photographer's portfolio.
- Allow users to book photography sessions.
- Allow users to submit photos for professional editing.

Primary operating area:
- Oxford and a clearly defined surrounding service area.

Current stack:
- Frontend: React + Vite (`client/`)
- Backend: Django + Django REST Framework (`server/`)

## Product Scope

### 1) Portfolio
- Display curated work from the lead photographer.
- Organize by categories (for example: weddings, portraits, events, products).
- Keep loading fast and image quality high.

### 2) Session Bookings
- Users can request photography sessions.
- Bookings should include date, location, session type, and contact details.
- Booking requests must be checked against the Oxford service-area policy.

### 3) Photo Editing Service
- Users can submit photos for editing.
- Collect user info, requested editing style/instructions, and delivery expectations.
- Support status tracking at a basic level (requested, in progress, delivered).

## Business Rules

- Service area is limited to Oxford plus a defined radius/zone.
- Out-of-area booking requests should not be silently accepted.
- Clear communication of response times and availability is required.
- Pricing details can be shown as starting prices if final quotes vary.

## UX Principles

- Keep the app simple, clean, and trust-building.
- Portfolio pages should feel visual-first and professional.
- Booking and editing flows should be short and clear.
- Always show helpful validation and error messages.
- Mobile responsiveness is required.

## Technical Guidelines

- Prefer small, focused React components.
- Keep API logic separate from UI logic where possible.
- Use typed, validated payloads between frontend and backend.
- On backend, validate all user input server-side.
- Keep CORS and security settings explicit for local dev and production.
- Never commit secrets (`.env`, keys, tokens, credentials).

## Data and Domain Model (Initial)

Suggested core entities:
- PortfolioItem
  - title, category, cover image, gallery images, description, featured flag
- BookingRequest
  - name, email, phone, session type, preferred date, location, notes, status
- EditingRequest
  - name, email, upload references, style notes, turnaround expectation, status

## API Direction (Initial)

Suggested endpoints:
- `GET /api/portfolio/`
- `POST /api/bookings/`
- `POST /api/editing-requests/`

Optional admin/internal endpoints later:
- Update booking/editing status
- Manage portfolio items

## Non-Goals (For Now)

- No complex marketplace behavior.
- No multi-vendor architecture.
- No advanced scheduling optimization.
- No heavy automation until core flows are stable.

## Quality Bar

- No broken forms.
- No uncaught backend validation errors returned as generic 500s.
- Clear success/failure states for every submit action.
- Basic tests for booking and editing request APIs.
- Reasonable performance for image-heavy pages.

## Immediate Priorities

1. Ensure portfolio rendering quality and responsive layout.
2. Implement a reliable booking request flow with service-area validation.
3. Implement a reliable photo editing request flow.
4. Confirm frontend-backend integration for all main forms.
5. Add basic API tests for booking and editing requests.

## AI Assistant Instructions

When making changes in this repository:
- Prioritize business value for a photography service.
- Preserve a simple UX and avoid unnecessary complexity.
- Keep code readable and beginner-friendly where possible.
- Suggest improvements that strengthen trust, clarity, and conversion.
- If requirements are ambiguous, choose the simplest valid implementation and document assumptions.
