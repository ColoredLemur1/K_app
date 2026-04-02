# Mobile Responsiveness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the homepage fully usable on mobile phones — hamburger full-screen overlay menu in the header, and grid layouts that stack vertically below 768px.

**Architecture:** A new `responsive.css` file holds all `@media (max-width: 768px)` rules that override inline styles via `!important`. Grid containers get CSS class names added so the media queries can target them. The header gains a `menuOpen` state and a React Fragment return so the full-screen overlay is a sibling element (not a child) of `<header>` — required because `backdrop-filter` on the header creates a new CSS containing block that breaks `position: fixed` children.

**Tech Stack:** React 18 · TypeScript · GSAP 3 · CSS media queries · Tailwind (for `hidden md:flex` utilities on existing elements)

---

## File Map

| File | Action |
|---|---|
| `client/src/styles/responsive.css` | Create — all mobile media query rules |
| `client/src/styles/index.css` | Modify — add `@import './responsive.css'` |
| `client/src/app/components/Portfolio.tsx` | Modify — add `portfolio-grid` class to grid div |
| `client/src/app/components/Services.tsx` | Modify — add `services-grid` class to grid div |
| `client/src/app/components/About.tsx` | Modify — add `about-grid` to outer grid div, `about-photo-wrap` to photo aspect div |
| `client/src/app/components/Header.tsx` | Modify — add hamburger button + full-screen overlay with GSAP fade |

---

## Task 1: responsive.css + import

**Files:**
- Create: `client/src/styles/responsive.css`
- Modify: `client/src/styles/index.css`

- [ ] **Step 1: Create `client/src/styles/responsive.css`**

```css
/* ============================================================
   Mobile overrides — breakpoint 768px
   Uses !important to override inline styles set in React.
   ============================================================ */

/* --- Portfolio --- */
@media (max-width: 768px) {
  .portfolio-grid {
    grid-template-columns: repeat(2, 1fr) !important;
  }
  #portfolio {
    padding: 72px 0 !important;
  }
  #portfolio > div {
    padding-left: 20px !important;
    padding-right: 20px !important;
  }
}

/* --- Services --- */
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
  #services > div {
    padding-left: 20px !important;
    padding-right: 20px !important;
  }
}

/* --- About --- */
@media (max-width: 768px) {
  .about-grid {
    grid-template-columns: 1fr !important;
    gap: 40px !important;
  }
  /* Text column first, photo column second */
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
  #about > div {
    padding-left: 20px !important;
    padding-right: 20px !important;
  }
}

/* --- Footer --- */
@media (max-width: 768px) {
  #contact > div {
    flex-direction: column !important;
    align-items: flex-start !important;
    gap: 16px !important;
  }
}
```

- [ ] **Step 2: Add the import to `client/src/styles/index.css`**

The current file ends with:
```css
.portfolio-card:hover .portfolio-tag {
  opacity: 1 !important;
}
```

Add the import at the top, after the existing imports (before the `.portfolio-card` rule):

```css
@import 'leaflet/dist/leaflet.css';
@import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';
@import './fonts.css';
@import './tailwind.css';
@import './theme.css';
@import './responsive.css';

.portfolio-card:hover .portfolio-tag {
  opacity: 1 !important;
}
```

- [ ] **Step 3: Commit**

```bash
git add client/src/styles/responsive.css client/src/styles/index.css
git commit -m "feat: add responsive.css with 768px mobile breakpoint rules"
```

---

## Task 2: Add CSS class names to grid containers

**Files:**
- Modify: `client/src/app/components/Portfolio.tsx`
- Modify: `client/src/app/components/Services.tsx`
- Modify: `client/src/app/components/About.tsx`

- [ ] **Step 1: Update `Portfolio.tsx` grid div**

Find this block (around line 140–148):
```tsx
        <div
          ref={gridRef}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 12,
          }}
          className="sm:grid-cols-2 grid-cols-1"
        >
```

Replace with:
```tsx
        <div
          ref={gridRef}
          className="portfolio-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 12,
          }}
        >
```

- [ ] **Step 2: Update `Services.tsx` grid div**

Find this block (around line 67–73):
```tsx
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 2,
        }}
          className="sm:grid-cols-1"
        >
```

Replace with:
```tsx
        <div
          className="services-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 2,
          }}
        >
```

- [ ] **Step 3: Update `About.tsx` — outer grid div and photo aspect div**

Find the outer grid div (around line 61–67):
```tsx
      <div style={{
        maxWidth: 1200, margin: '0 auto', padding: '0 32px',
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80,
        alignItems: 'center',
      }}
        className="sm:grid-cols-1"
      >
```

Replace with:
```tsx
      <div
        className="about-grid"
        style={{
          maxWidth: 1200, margin: '0 auto', padding: '0 32px',
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80,
          alignItems: 'center',
        }}
      >
```

Then find the photo aspect-ratio div (around line 71–74):
```tsx
          <div style={{
            aspectRatio: '3/4', overflow: 'hidden',
            background: '#f5f5f5',
          }}>
```

Replace with:
```tsx
          <div
            className="about-photo-wrap"
            style={{
              aspectRatio: '3/4', overflow: 'hidden',
              background: '#f5f5f5',
            }}
          >
```

- [ ] **Step 4: Commit**

```bash
git add client/src/app/components/Portfolio.tsx client/src/app/components/Services.tsx client/src/app/components/About.tsx
git commit -m "feat: add CSS class names to grid containers for mobile breakpoint targeting"
```

---

## Task 3: Header — hamburger button + full-screen overlay

**Files:**
- Modify: `client/src/app/components/Header.tsx`

- [ ] **Step 1: Replace the entire contents of `client/src/app/components/Header.tsx`**

```tsx
import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import gsap from 'gsap';

const NAV_LINKS = [
  { label: 'Portfolio', id: 'portfolio' },
  { label: 'Services',  id: 'services'  },
  { label: 'About',     id: 'about'     },
  { label: 'Contact',   id: 'contact'   },
];

export function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  const handleLogout = () => { logout(); navigate('/'); };

  const closeMenu = () => setMenuOpen(false);

  const handleNavClick = (id: string) => {
    closeMenu();
    setTimeout(() => scrollTo(id), 280);
  };

  // GSAP fade the overlay in/out
  useEffect(() => {
    const el = overlayRef.current;
    if (!el) return;
    if (menuOpen) {
      gsap.fromTo(el,
        { opacity: 0, pointerEvents: 'none' },
        { opacity: 1, pointerEvents: 'auto', duration: 0.25 }
      );
      document.body.style.overflow = 'hidden';
    } else {
      gsap.to(el, {
        opacity: 0, pointerEvents: 'none', duration: 0.25,
        onComplete: () => { document.body.style.overflow = ''; },
      });
    }
  }, [menuOpen]);

  return (
    <>
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0,
        zIndex: 1000,
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(0,0,0,0.06)',
      }}>
        <div style={{
          maxWidth: 1200, margin: '0 auto',
          padding: '0 32px',
          height: 64,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>

          {/* Logo */}
          <Link to="/" style={{ textDecoration: 'none' }}>
            <span style={{
              fontFamily: "'Helvetica Neue', Arial, sans-serif",
              fontSize: 13, fontWeight: 500, letterSpacing: '0.12em',
              textTransform: 'uppercase', color: '#111',
            }}>
              Kay Tubillla
            </span>
          </Link>

          {/* Scroll nav — desktop only */}
          <nav style={{ display: 'flex', gap: 32 }} className="hidden md:flex">
            {NAV_LINKS.map(({ label, id }) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                style={{
                  background: 'none', border: 'none', padding: 0,
                  fontFamily: "'Helvetica Neue', Arial, sans-serif",
                  fontSize: 12, fontWeight: 400, letterSpacing: '0.08em',
                  textTransform: 'uppercase', color: '#444',
                  cursor: 'pointer', transition: 'color 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = '#111')}
                onMouseLeave={e => (e.currentTarget.style.color = '#444')}
              >
                {label}
              </button>
            ))}
            <Link
              to="/service-area"
              style={{
                fontFamily: "'Helvetica Neue', Arial, sans-serif",
                fontSize: 12, fontWeight: 400, letterSpacing: '0.08em',
                textTransform: 'uppercase', color: '#444',
                textDecoration: 'none', transition: 'color 0.2s',
              }}
            >
              Area
            </Link>
          </nav>

          {/* Right side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>

            {/* Book + Editing — desktop only */}
            <Link to="/book" className="hidden md:inline" style={{
              fontFamily: "'Helvetica Neue', Arial, sans-serif",
              fontSize: 12, fontWeight: 500, letterSpacing: '0.08em',
              textTransform: 'uppercase', color: '#111', textDecoration: 'none',
            }}>
              Book
            </Link>
            <Link to="/editing" className="hidden md:inline" style={{
              fontFamily: "'Helvetica Neue', Arial, sans-serif",
              fontSize: 12, fontWeight: 500, letterSpacing: '0.08em',
              textTransform: 'uppercase', color: '#111', textDecoration: 'none',
            }}>
              Editing
            </Link>

            <div className="hidden md:block" style={{ width: 1, height: 16, background: '#ddd' }} />

            {/* Auth — always visible */}
            {user ? (
              <button
                onClick={handleLogout}
                style={{
                  padding: '8px 18px',
                  background: '#111', color: '#fff',
                  border: 'none',
                  fontFamily: "'Helvetica Neue', Arial, sans-serif",
                  fontSize: 11, fontWeight: 500, letterSpacing: '0.1em',
                  textTransform: 'uppercase', cursor: 'pointer',
                }}
              >
                Log Out
              </button>
            ) : (
              <>
                <Link to="/login" style={{
                  padding: '7px 16px',
                  border: '1px solid #111', color: '#111',
                  fontFamily: "'Helvetica Neue', Arial, sans-serif",
                  fontSize: 11, fontWeight: 500, letterSpacing: '0.1em',
                  textTransform: 'uppercase', textDecoration: 'none',
                  transition: 'background 0.2s, color 0.2s',
                }}>
                  Log In
                </Link>
                <Link to="/register" style={{
                  padding: '8px 18px',
                  background: '#111', color: '#fff',
                  fontFamily: "'Helvetica Neue', Arial, sans-serif",
                  fontSize: 11, fontWeight: 500, letterSpacing: '0.1em',
                  textTransform: 'uppercase', textDecoration: 'none',
                }}>
                  Register
                </Link>
              </>
            )}

            {/* Hamburger — mobile only */}
            <button
              onClick={() => setMenuOpen(true)}
              className="md:hidden"
              aria-label="Open menu"
              style={{
                background: 'none', border: 'none', padding: '4px 0 4px 8px',
                cursor: 'pointer', display: 'flex', flexDirection: 'column',
                gap: 5, justifyContent: 'center',
              }}
            >
              <span style={{ display: 'block', width: 20, height: 1.5, background: '#111' }} />
              <span style={{ display: 'block', width: 20, height: 1.5, background: '#111' }} />
              <span style={{ display: 'block', width: 20, height: 1.5, background: '#111' }} />
            </button>
          </div>
        </div>
      </header>

      {/* Full-screen mobile overlay — sibling of <header>, NOT a child */}
      <div
        ref={overlayRef}
        style={{
          position: 'fixed', inset: 0, zIndex: 2000,
          background: '#fff',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          opacity: 0, pointerEvents: 'none',
          fontFamily: "'Helvetica Neue', Arial, sans-serif",
        }}
      >
        {/* Close button */}
        <button
          onClick={closeMenu}
          aria-label="Close menu"
          style={{
            position: 'absolute', top: 20, right: 24,
            background: 'none', border: 'none',
            fontSize: 32, color: '#111', cursor: 'pointer',
            lineHeight: 1, padding: 4,
          }}
        >
          ×
        </button>

        {/* Nav links */}
        <nav style={{
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', gap: 24, marginBottom: 48,
        }}>
          {NAV_LINKS.map(({ label, id }) => (
            <button
              key={id}
              onClick={() => handleNavClick(id)}
              style={{
                background: 'none', border: 'none', padding: 0,
                fontSize: 'clamp(28px, 8vw, 40px)', fontWeight: 300,
                letterSpacing: '-0.01em', color: '#111',
                cursor: 'pointer',
                fontFamily: "'Helvetica Neue', Arial, sans-serif",
              }}
            >
              {label}
            </button>
          ))}
          <Link
            to="/service-area"
            onClick={closeMenu}
            style={{
              fontSize: 'clamp(28px, 8vw, 40px)', fontWeight: 300,
              letterSpacing: '-0.01em', color: '#111',
              textDecoration: 'none',
              fontFamily: "'Helvetica Neue', Arial, sans-serif",
            }}
          >
            Area
          </Link>
        </nav>

        {/* CTA buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
          <Link
            to="/book"
            onClick={closeMenu}
            style={{
              padding: '14px 40px', background: '#111', color: '#fff',
              fontSize: 11, fontWeight: 600, letterSpacing: '0.15em',
              textTransform: 'uppercase', textDecoration: 'none',
            }}
          >
            Book a Session
          </Link>
          <Link
            to="/editing"
            onClick={closeMenu}
            style={{
              padding: '13px 40px',
              border: '1px solid #111', color: '#111',
              fontSize: 11, fontWeight: 600, letterSpacing: '0.15em',
              textTransform: 'uppercase', textDecoration: 'none',
            }}
          >
            Submit for Editing
          </Link>
        </div>
      </div>
    </>
  );
}
```

- [ ] **Step 2: Verify the build compiles**

```bash
cd client && npm run build 2>&1 | tail -20
```

Expected: build completes with no errors. Chunk size warnings are fine.

- [ ] **Step 3: Commit**

```bash
git add client/src/app/components/Header.tsx
git commit -m "feat: add mobile hamburger menu with full-screen overlay"
```

---

## Self-Review

**Spec coverage:**
- ✅ §1 Hamburger opens full-screen white overlay
- ✅ §1 Nav links (Portfolio, Services, About, Contact, Area) in overlay, large centred text
- ✅ §1 Book a Session + Submit for Editing CTAs in overlay
- ✅ §1 × close button top-right
- ✅ §1 GSAP opacity fade in/out (0.25s)
- ✅ §1 Body scroll locked while overlay open
- ✅ §1 Auth buttons (Log In / Register) always visible in header bar
- ✅ §1 Overlay is sibling of `<header>` (Fragment return) — backdrop-filter fix
- ✅ §2 `portfolio-grid` → 2 columns on mobile
- ✅ §2 `services-grid` → 1 column on mobile, card padding reduced
- ✅ §2 `about-grid` → 1 column, text first (order swap), photo aspect ratio 16/9
- ✅ §2 Footer flex → column on mobile
- ✅ §2 Section padding 120px → 72px on mobile
- ✅ §2 Horizontal padding 32px → 20px on mobile

**Placeholder scan:** No TBDs. All code blocks complete.

**Type consistency:** `overlayRef` typed `useRef<HTMLDivElement>`, consistent with how GSAP targets it. `menuOpen` is `boolean` state, used correctly throughout.
