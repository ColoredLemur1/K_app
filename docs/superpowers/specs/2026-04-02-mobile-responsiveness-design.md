# Mobile Responsiveness Design

**Goal:** Make the homepage fully usable on mobile phones by adding a hamburger full-screen overlay menu and fixing grid layouts that currently stay multi-column on small screens.

**Approach:** CSS media queries in a new `responsive.css` file (imported into `index.css`). Layout-critical grid containers get a CSS class name added; the media queries use `!important` to override the existing inline styles at the 768px breakpoint. The header overlay is handled with React state inside `Header.tsx`.

**Breakpoint:** 768px (`max-width: 768px`)

---

## 1. Header — Mobile Menu

### Desktop (≥ 769px) — unchanged
- Logo left, nav links centre, Book + Editing + divider + Log In / Register right

### Mobile (≤ 768px)
**Header bar shows:**
- Logo (left)
- Log In + Register buttons (right) — always visible, never hidden
- Hamburger icon (far right of the auth buttons) — three horizontal lines, 20×14px, `#111`

**Full-screen overlay (open state):**
- `position: fixed`, `inset: 0`, `zIndex: 2000`, `background: #fff`
- × close button: top-right, `position: absolute`, `top: 20px`, `right: 24px`
- Nav links stacked vertically, centred:
  - Portfolio, Services, About, Contact, Area
  - `fontSize: clamp(28px, 8vw, 40px)`, `fontWeight: 300`, `letterSpacing: -0.01em`
  - Each link scrolls to its section and closes the overlay
- Below nav links, two CTA links:
  - "Book a Session" → `/book` (filled black button)
  - "Submit for Editing" → `/editing` (outlined button)
- GSAP fade: `opacity` 0 → 1 on open, 1 → 0 on close, `duration: 0.25`
- Body scroll locked while overlay is open (`document.body.style.overflow = 'hidden'`); restored on close

**Implementation:** `useState<boolean>` (`menuOpen`) in `Header.tsx`. `Header` returns a React Fragment containing both the `<header>` bar and the overlay `<div>` as siblings — the overlay must NOT be a child of `<header>` because `backdrop-filter` on the header creates a new CSS containing block that breaks `position: fixed` on children. GSAP animates the overlay's opacity via a `useEffect` watching `menuOpen`.

---

## 2. CSS File — `client/src/styles/responsive.css`

New file, imported in `client/src/styles/index.css` as `@import './responsive.css';`

### Portfolio grid

Add class `portfolio-grid` to the grid `<div>` in `Portfolio.tsx`.

```css
@media (max-width: 768px) {
  .portfolio-grid {
    grid-template-columns: repeat(2, 1fr) !important;
  }
  #portfolio {
    padding: 72px 0 !important;
  }
}
```

### Services grid

Add class `services-grid` to the grid `<div>` in `Services.tsx`.

```css
@media (max-width: 768px) {
  .services-grid {
    grid-template-columns: 1fr !important;
  }
  .service-card {
    padding: 40px 24px !important;
  }
  #services {
    padding: 72px 0 !important;
  }
}
```

### About grid

Add class `about-grid` to the outer grid `<div>` in `About.tsx`.  
Add class `about-photo-wrap` to the inner photo aspect-ratio `<div>`.

```css
@media (max-width: 768px) {
  .about-grid {
    grid-template-columns: 1fr !important;
    gap: 40px !important;
  }
  /* Reverse column order: text first, photo second */
  .about-grid > div:first-child {
    order: 2;
  }
  .about-grid > div:last-child {
    order: 1;
  }
  .about-photo-wrap {
    aspect-ratio: 16 / 9 !important;
  }
  #about {
    padding: 72px 0 !important;
  }
}
```

### Footer

```css
@media (max-width: 768px) {
  #contact > div {
    flex-direction: column !important;
    align-items: flex-start !important;
    gap: 16px !important;
  }
}
```

### Section horizontal padding

Reduce side padding from 32px to 20px on mobile for all inner containers.

```css
@media (max-width: 768px) {
  #portfolio > div,
  #services > div,
  #about > div {
    padding-left: 20px !important;
    padding-right: 20px !important;
  }
}
```

---

## 3. Files Changed

| File | Change |
|---|---|
| `client/src/app/components/Header.tsx` | Add `menuOpen` state, hamburger button, full-screen overlay, GSAP fade |
| `client/src/app/components/Portfolio.tsx` | Add `className="portfolio-grid"` to grid div |
| `client/src/app/components/Services.tsx` | Add `className="services-grid"` to grid div |
| `client/src/app/components/About.tsx` | Add `className="about-grid"` to outer grid div, `className="about-photo-wrap"` to photo aspect div |
| `client/src/styles/responsive.css` | New file — all media query rules |
| `client/src/styles/index.css` | Add `@import './responsive.css';` |

---

## 4. Out of Scope

- Tablet-specific breakpoints (768px covers the main mobile use case)
- Animated hamburger icon morphing (three lines → X is sufficient)
- Touch swipe gestures on the hero slideshow
- Mobile-specific hero height changes (100vh works fine on mobile)
