# Homepage UI — Monochrome Redesign + GSAP Animations

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the entire homepage visual layer to match the approved Kay Tubillla Photography design — monochrome (black/white), GSAP + ScrollTrigger animations, custom cursor, and a portfolio grid that pulls live from the API.

**Architecture:** All homepage section components are rewritten in place (same file paths). A new `Cursor.tsx` component is added. A new `Services.tsx` replaces the old `Packages.tsx` (which is removed from the route). The backend gains a public `GET /api/portfolio/` endpoint. All GSAP animations are scoped with `gsap.context()` and cleaned up in `useEffect` returns. No external font packages — the design uses system fonts (Helvetica Neue / Arial).

**Tech Stack:** React 18 · TypeScript · GSAP 3 + ScrollTrigger · Tailwind (layout utilities only) · Django REST Framework (portfolio endpoint)

---

## Design Tokens (use these throughout)

```
Background:     #ffffff (white)
Text primary:   #111111
Text secondary: #888888
Light bg:       #f5f5f5
Border:         #e5e5e5
Black card:     #111111
Font family:    'Helvetica Neue', Arial, sans-serif
Heading weight: 300 (large display), 500 (labels)
Body weight:    400
Letter-spacing (eyebrow labels): 0.15em
```

---

## File Map

### Backend — modify
| File | Action |
|---|---|
| `server/content/views.py` | Add `portfolio_list` view |
| `server/content/urls.py` | Add `portfolio/` URL pattern |

### Frontend — modify
| File | Action |
|---|---|
| `client/src/app/App.tsx` | Add Cursor, swap Packages→Services, remove Contact from HomePage |
| `client/src/app/components/Header.tsx` | Full monochrome redesign |
| `client/src/app/components/Hero.tsx` | GSAP 4-slide crossfade slideshow |
| `client/src/app/components/Portfolio.tsx` | API-connected, category filter, GSAP stagger |
| `client/src/app/components/About.tsx` | Two-column, GSAP scroll reveals |
| `client/src/app/components/Footer.tsx` | Simple black bar |

### Frontend — create
| File | Action |
|---|---|
| `client/src/app/components/Cursor.tsx` | Custom dot + ring cursor (desktop only) |
| `client/src/app/components/Services.tsx` | Two-card services section |

### Frontend — remove from render (keep file)
- `client/src/app/components/Contact.tsx` — removed from `HomePage` in App.tsx; file left in place for potential future use
- `client/src/app/components/Packages.tsx` — removed from `HomePage`; file left in place

---

## Task 1: Portfolio API endpoint

**Files:**
- Modify: `server/content/views.py`
- Modify: `server/content/urls.py`

- [ ] **Step 1: Add the portfolio_list view**

Open `server/content/views.py` and **append** this view after the existing content (do NOT remove existing views):

```python
@api_view(['GET'])
@permission_classes([AllowAny])
def portfolio_list(request):
    """
    Returns all portfolio items ordered by `order` then `-created_at`.
    Optional query param: ?category=wedding
    """
    qs = PortfolioItem.objects.all()
    category = request.query_params.get('category')
    if category:
        qs = qs.filter(category=category)
    items = []
    for item in qs:
        items.append({
            'id': item.id,
            'title': item.title,
            'category': item.category,
            'image': request.build_absolute_uri(item.image.url) if item.image else None,
            'featured': item.featured,
            'order': item.order,
        })
    return Response(items)
```

Also add `PortfolioItem` to the import at the top of views.py (it currently only imports `ServiceArea`):

```python
from .models import ServiceArea, PortfolioItem
```

- [ ] **Step 2: Add the URL pattern**

Replace `server/content/urls.py` with:

```python
from django.urls import path
from . import views

urlpatterns = [
    path('service-area/', views.service_area_detail),
    path('service-area/check/', views.service_area_check),
    path('portfolio/', views.portfolio_list),
]
```

- [ ] **Step 3: Verify with Django check**

```bash
cd server
venv/Scripts/python manage.py check
```

Expected: `System check identified no issues (0 silenced).`

- [ ] **Step 4: Commit**

```bash
git add server/content/views.py server/content/urls.py
git commit -m "feat: add public portfolio list API endpoint"
```

---

## Task 2: Custom cursor

**Files:**
- Create: `client/src/app/components/Cursor.tsx`

- [ ] **Step 1: Create the component**

Create `client/src/app/components/Cursor.tsx`:

```tsx
import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only on desktop (non-touch)
    if (window.matchMedia('(hover: none)').matches) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    // Hide default cursor on body
    document.body.style.cursor = 'none';

    const xDot  = gsap.quickTo(dot,  'x', { duration: 0.1, ease: 'none' });
    const yDot  = gsap.quickTo(dot,  'y', { duration: 0.1, ease: 'none' });
    const xRing = gsap.quickTo(ring, 'x', { duration: 0.4, ease: 'power3' });
    const yRing = gsap.quickTo(ring, 'y', { duration: 0.4, ease: 'power3' });

    const onMove = (e: MouseEvent) => {
      xDot(e.clientX);
      yDot(e.clientY);
      xRing(e.clientX);
      yRing(e.clientY);
    };

    window.addEventListener('mousemove', onMove);
    return () => {
      window.removeEventListener('mousemove', onMove);
      document.body.style.cursor = '';
    };
  }, []);

  return (
    <>
      {/* Small solid dot */}
      <div
        ref={dotRef}
        style={{
          position: 'fixed',
          top: -4,
          left: -4,
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: '#111',
          pointerEvents: 'none',
          zIndex: 99999,
          willChange: 'transform',
        }}
      />
      {/* Larger trailing ring */}
      <div
        ref={ringRef}
        style={{
          position: 'fixed',
          top: -16,
          left: -16,
          width: 32,
          height: 32,
          borderRadius: '50%',
          border: '1.5px solid #111',
          pointerEvents: 'none',
          zIndex: 99998,
          willChange: 'transform',
        }}
      />
    </>
  );
}
```

- [ ] **Step 2: Verify the build compiles**

```bash
cd client
npx tsc --noEmit
```

Expected: no TypeScript errors.

- [ ] **Step 3: Commit**

```bash
git add client/src/app/components/Cursor.tsx
git commit -m "feat: add custom dot+ring cursor for desktop"
```

---

## Task 3: Header redesign

**Files:**
- Modify: `client/src/app/components/Header.tsx`

- [ ] **Step 1: Read the current Header.tsx to understand the structure**

The current Header.tsx uses emerald Tailwind classes and `useAuth` + `useNavigate`. Keep those imports — only the visual design changes.

- [ ] **Step 2: Replace Header.tsx**

Replace the entire contents of `client/src/app/components/Header.tsx` with:

```tsx
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_LINKS = [
  { label: 'Portfolio', id: 'portfolio' },
  { label: 'Services',  id: 'services'  },
  { label: 'About',     id: 'about'     },
  { label: 'Contact',   id: 'contact'   },
];

export function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  const handleLogout = () => { logout(); navigate('/'); };

  return (
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

        {/* Scroll nav — hidden on small screens */}
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

        {/* Right CTAs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link to="/book" style={{
            fontFamily: "'Helvetica Neue', Arial, sans-serif",
            fontSize: 12, fontWeight: 500, letterSpacing: '0.08em',
            textTransform: 'uppercase', color: '#111', textDecoration: 'none',
          }}>
            Book
          </Link>
          <Link to="/editing" style={{
            fontFamily: "'Helvetica Neue', Arial, sans-serif",
            fontSize: 12, fontWeight: 500, letterSpacing: '0.08em',
            textTransform: 'uppercase', color: '#111', textDecoration: 'none',
          }}>
            Editing
          </Link>

          <div style={{ width: 1, height: 16, background: '#ddd' }} />

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
        </div>
      </div>
    </header>
  );
}
```

- [ ] **Step 3: Verify build**

```bash
cd client && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add client/src/app/components/Header.tsx
git commit -m "feat: redesign Header — monochrome, frosted white, nav + CTAs"
```

---

## Task 4: Hero slideshow with GSAP

**Files:**
- Modify: `client/src/app/components/Hero.tsx`

- [ ] **Step 1: Replace Hero.tsx**

Replace the entire contents of `client/src/app/components/Hero.tsx`:

```tsx
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';

const SLIDES = [
  {
    url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1800&q=80',
    alt: 'Wedding photography',
  },
  {
    url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=1800&q=80',
    alt: 'Portrait photography',
  },
  {
    url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1800&q=80',
    alt: 'Landscape photography',
  },
  {
    url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1800&q=80',
    alt: 'Event photography',
  },
];

export function Hero() {
  const [activeIdx, setActiveIdx] = useState(0);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const textRef = useRef<HTMLDivElement>(null);

  // Initial state: first slide visible, rest hidden
  useEffect(() => {
    slideRefs.current.forEach((el, i) => {
      if (!el) return;
      gsap.set(el, { opacity: i === 0 ? 1 : 0, scale: i === 0 ? 1.04 : 1 });
    });

    // Entrance animation for text
    if (textRef.current) {
      gsap.from(textRef.current.children, {
        y: 30, opacity: 0, stagger: 0.12, duration: 1.1,
        ease: 'power3.out', delay: 0.4,
      });
    }
  }, []);

  // Cycle slides every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIdx(prev => {
        const next = (prev + 1) % SLIDES.length;
        const outEl = slideRefs.current[prev];
        const inEl  = slideRefs.current[next];
        if (outEl) gsap.to(outEl, { opacity: 0, scale: 1,    duration: 1.4, ease: 'power2.inOut' });
        if (inEl)  gsap.to(inEl,  { opacity: 1, scale: 1.04, duration: 1.4, ease: 'power2.inOut' });
        return next;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const goTo = (idx: number) => {
    if (idx === activeIdx) return;
    const outEl = slideRefs.current[activeIdx];
    const inEl  = slideRefs.current[idx];
    if (outEl) gsap.to(outEl, { opacity: 0, scale: 1,    duration: 1.0, ease: 'power2.inOut' });
    if (inEl)  gsap.to(inEl,  { opacity: 1, scale: 1.04, duration: 1.0, ease: 'power2.inOut' });
    setActiveIdx(idx);
  };

  return (
    <section style={{
      position: 'relative', height: '100vh', minHeight: 600,
      overflow: 'hidden', background: '#111',
    }}>
      {/* Slide images */}
      {SLIDES.map((slide, i) => (
        <div
          key={i}
          ref={el => { slideRefs.current[i] = el; }}
          style={{
            position: 'absolute', inset: 0, overflow: 'hidden',
          }}
        >
          <img
            src={slide.url}
            alt={slide.alt}
            style={{
              width: '100%', height: '100%', objectFit: 'cover',
              display: 'block',
            }}
          />
        </div>
      ))}

      {/* Dark overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.55) 100%)',
        zIndex: 1,
      }} />

      {/* Text content */}
      <div
        ref={textRef}
        style={{
          position: 'absolute', inset: 0, zIndex: 2,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          textAlign: 'center', padding: '0 24px',
          fontFamily: "'Helvetica Neue', Arial, sans-serif",
          color: '#fff',
        }}
      >
        <p style={{
          fontSize: 11, letterSpacing: '0.3em', textTransform: 'uppercase',
          fontWeight: 400, marginBottom: 20, opacity: 0.8,
        }}>
          Oxford · Photography
        </p>
        <h1 style={{
          fontSize: 'clamp(52px, 8vw, 100px)', fontWeight: 300,
          letterSpacing: '-0.02em', lineHeight: 1.0,
          margin: '0 0 20px 0',
        }}>
          Kay Tubillla
        </h1>
        <p style={{
          fontSize: 'clamp(14px, 1.8vw, 18px)', fontWeight: 300,
          letterSpacing: '0.04em', opacity: 0.85,
          maxWidth: 420, lineHeight: 1.7, marginBottom: 40,
        }}>
          Weddings · Portraits · Events · Oxford & surrounding area
        </p>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link to="/book" style={{
            padding: '14px 32px', background: '#fff', color: '#111',
            fontSize: 11, fontWeight: 600, letterSpacing: '0.15em',
            textTransform: 'uppercase', textDecoration: 'none',
            transition: 'background 0.2s',
          }}>
            Book a Session
          </Link>
          <Link to="/editing" style={{
            padding: '14px 32px',
            border: '1px solid rgba(255,255,255,0.7)', color: '#fff',
            fontSize: 11, fontWeight: 600, letterSpacing: '0.15em',
            textTransform: 'uppercase', textDecoration: 'none',
          }}>
            Submit for Editing
          </Link>
        </div>
      </div>

      {/* Slide dot indicators — bottom right */}
      <div style={{
        position: 'absolute', bottom: 32, right: 40, zIndex: 3,
        display: 'flex', gap: 8,
      }}>
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            style={{
              width: i === activeIdx ? 24 : 8, height: 8,
              borderRadius: 4,
              background: i === activeIdx ? '#fff' : 'rgba(255,255,255,0.4)',
              border: 'none', padding: 0, cursor: 'pointer',
              transition: 'width 0.3s, background 0.3s',
            }}
          />
        ))}
      </div>

      {/* Scroll hint — bottom left */}
      <div style={{
        position: 'absolute', bottom: 32, left: 40, zIndex: 3,
        display: 'flex', alignItems: 'center', gap: 10,
        color: 'rgba(255,255,255,0.6)',
        fontFamily: "'Helvetica Neue', Arial, sans-serif",
        fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase',
      }}>
        <div style={{
          width: 1, height: 32, background: 'rgba(255,255,255,0.4)',
        }} />
        Scroll
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
cd client && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add client/src/app/components/Hero.tsx
git commit -m "feat: rebuild Hero as GSAP 4-slide crossfade slideshow"
```

---

## Task 5: Portfolio section — API-connected with GSAP scroll reveals

**Files:**
- Modify: `client/src/app/components/Portfolio.tsx`

- [ ] **Step 1: Replace Portfolio.tsx**

Replace the entire contents of `client/src/app/components/Portfolio.tsx`:

```tsx
import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface PortfolioItem {
  id: number;
  title: string;
  category: string;
  image: string | null;
  featured: boolean;
  order: number;
}

const CATEGORIES = ['All', 'Wedding', 'Portrait', 'Event', 'Landscape', 'Product'] as const;

// Fallback placeholder images shown when DB is empty
const PLACEHOLDERS: PortfolioItem[] = [
  { id: -1, title: 'Wedding', category: 'wedding', featured: false, order: 0,
    image: 'https://images.unsplash.com/photo-1533091090875-1ff4acc497dd?w=800&q=80' },
  { id: -2, title: 'Portrait', category: 'portrait', featured: false, order: 1,
    image: 'https://images.unsplash.com/photo-1544124094-8aea0374da93?w=800&q=80' },
  { id: -3, title: 'Landscape', category: 'landscape', featured: false, order: 2,
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80' },
  { id: -4, title: 'Event', category: 'event', featured: false, order: 3,
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80' },
  { id: -5, title: 'Portrait', category: 'portrait', featured: false, order: 4,
    image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&q=80' },
  { id: -6, title: 'Product', category: 'product', featured: false, order: 5,
    image: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=800&q=80' },
];

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api';

export function Portfolio() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [loading, setLoading] = useState(true);
  const gridRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);

  // Fetch portfolio from API, fall back to placeholders
  useEffect(() => {
    fetch(`${BASE_URL}/portfolio/`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then((data: PortfolioItem[]) => setItems(data.length > 0 ? data : PLACEHOLDERS))
      .catch(() => setItems(PLACEHOLDERS))
      .finally(() => setLoading(false));
  }, []);

  // Scroll-triggered title reveal
  useEffect(() => {
    if (!titleRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(titleRef.current!.children, {
        y: 60, opacity: 0, stagger: 0.1, duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: titleRef.current,
          start: 'top 82%',
        },
      });
    });
    return () => ctx.revert();
  }, []);

  // Stagger grid items when they enter viewport (re-run on filter change)
  useEffect(() => {
    if (loading || !gridRef.current) return;
    const cards = gridRef.current.querySelectorAll('.portfolio-card');
    const ctx = gsap.context(() => {
      gsap.from(cards, {
        y: 40, opacity: 0, stagger: 0.07, duration: 0.7,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: gridRef.current,
          start: 'top 85%',
        },
      });
    });
    return () => ctx.revert();
  }, [loading, activeCategory]);

  const filtered = activeCategory === 'All'
    ? items
    : items.filter(item => item.category.toLowerCase() === activeCategory.toLowerCase());

  return (
    <section
      id="portfolio"
      ref={sectionRef}
      style={{
        background: '#fff', padding: '120px 0',
        fontFamily: "'Helvetica Neue', Arial, sans-serif",
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px' }}>

        {/* Section header */}
        <div ref={titleRef} style={{ marginBottom: 56 }}>
          <p style={{
            fontSize: 10, letterSpacing: '0.25em', textTransform: 'uppercase',
            color: '#888', marginBottom: 12, fontWeight: 500,
          }}>
            Portfolio
          </p>
          <h2 style={{
            fontSize: 'clamp(36px, 5vw, 64px)', fontWeight: 300,
            color: '#111', letterSpacing: '-0.02em', margin: 0,
          }}>
            Selected Work
          </h2>
        </div>

        {/* Category filter */}
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 48 }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: '8px 20px',
                background: activeCategory === cat ? '#111' : 'transparent',
                color: activeCategory === cat ? '#fff' : '#888',
                border: activeCategory === cat ? '1px solid #111' : '1px solid #ddd',
                fontFamily: "'Helvetica Neue', Arial, sans-serif",
                fontSize: 11, fontWeight: 500, letterSpacing: '0.1em',
                textTransform: 'uppercase', cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div
          ref={gridRef}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 12,
          }}
          className="sm:grid-cols-2 grid-cols-1"
        >
          {filtered.map(item => (
            <div
              key={item.id}
              className="portfolio-card"
              style={{
                position: 'relative', overflow: 'hidden',
                aspectRatio: '1',
                background: '#f5f5f5',
                cursor: 'pointer',
              }}
              onMouseEnter={e => gsap.to(e.currentTarget.querySelector('img'), { scale: 0.96, duration: 0.4, ease: 'power2.out' })}
              onMouseLeave={e => gsap.to(e.currentTarget.querySelector('img'), { scale: 1.04, duration: 0.4, ease: 'power2.out' })}
            >
              {item.image && (
                <img
                  src={item.image}
                  alt={item.title}
                  style={{
                    width: '100%', height: '100%', objectFit: 'cover',
                    display: 'block', transform: 'scale(1.04)',
                    transition: 'none',
                  }}
                />
              )}
              {/* Category tag on hover */}
              <div style={{
                position: 'absolute', inset: 0,
                background: 'rgba(0,0,0,0)',
                display: 'flex', alignItems: 'flex-end',
                padding: 16, transition: 'background 0.3s',
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(0,0,0,0.25)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(0,0,0,0)'; }}
              >
                <span style={{
                  fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase',
                  color: '#fff', fontWeight: 500, opacity: 0,
                  transition: 'opacity 0.3s',
                }}
                  className="portfolio-tag"
                >
                  {item.category}
                </span>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && !loading && (
          <p style={{ color: '#888', fontSize: 14, textAlign: 'center', padding: '48px 0' }}>
            No images in this category yet.
          </p>
        )}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Add the hover tag visibility via CSS**

Open `client/src/styles/index.css` and append at the bottom:

```css
.portfolio-card:hover .portfolio-tag {
  opacity: 1 !important;
}
```

- [ ] **Step 3: Verify build**

```bash
cd client && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add client/src/app/components/Portfolio.tsx client/src/styles/index.css
git commit -m "feat: rebuild Portfolio — API-connected, category filter, GSAP scroll stagger"
```

---

## Task 6: Services section (two-card)

**Files:**
- Create: `client/src/app/components/Services.tsx`

- [ ] **Step 1: Create Services.tsx**

Create `client/src/app/components/Services.tsx`:

```tsx
import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const SERVICES = [
  {
    number: '01',
    title: 'Photography Sessions',
    description:
      'Weddings, portraits, events, and products — captured with precision and artistry. Available on location throughout Oxford and the surrounding area.',
    cta: 'Book a session',
    href: '/book',
    dark: false,
  },
  {
    number: '02',
    title: 'Photo Editing',
    description:
      'Submit your own photos for professional post-processing. Colour grading, retouching, and style-matched editing delivered to your brief.',
    cta: 'Submit photos',
    href: '/editing',
    dark: true,
  },
] as const;

export function Services() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from('.service-card', {
        y: 50, opacity: 0, stagger: 0.15, duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 78%',
        },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      id="services"
      ref={sectionRef}
      style={{
        background: '#f5f5f5', padding: '120px 0',
        fontFamily: "'Helvetica Neue', Arial, sans-serif",
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px' }}>

        {/* Section label */}
        <p style={{
          fontSize: 10, letterSpacing: '0.25em', textTransform: 'uppercase',
          color: '#888', marginBottom: 56, fontWeight: 500,
        }}>
          Services
        </p>

        {/* Two cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 2,
        }}
          className="sm:grid-cols-1"
        >
          {SERVICES.map(svc => (
            <div
              key={svc.number}
              className="service-card"
              style={{
                background: svc.dark ? '#111' : '#fff',
                color: svc.dark ? '#fff' : '#111',
                padding: '64px 48px',
                display: 'flex', flexDirection: 'column',
              }}
            >
              {/* Number */}
              <span style={{
                fontSize: 72, fontWeight: 300, lineHeight: 1,
                color: svc.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.07)',
                marginBottom: 32, display: 'block',
                letterSpacing: '-0.04em',
              }}>
                {svc.number}
              </span>

              {/* Title */}
              <h3 style={{
                fontSize: 28, fontWeight: 300, letterSpacing: '-0.01em',
                marginBottom: 20, lineHeight: 1.2,
              }}>
                {svc.title}
              </h3>

              {/* Description */}
              <p style={{
                fontSize: 14, lineHeight: 1.8, fontWeight: 400,
                color: svc.dark ? 'rgba(255,255,255,0.65)' : '#666',
                marginBottom: 40, flex: 1,
              }}>
                {svc.description}
              </p>

              {/* Arrow CTA */}
              <Link
                to={svc.href}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 10,
                  fontSize: 11, fontWeight: 600, letterSpacing: '0.15em',
                  textTransform: 'uppercase', textDecoration: 'none',
                  color: svc.dark ? '#fff' : '#111',
                  borderBottom: `1px solid ${svc.dark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)'}`,
                  paddingBottom: 4,
                }}
                onMouseEnter={e => {
                  const arrow = e.currentTarget.querySelector('.arrow') as HTMLElement;
                  if (arrow) gsap.to(arrow, { x: 6, duration: 0.25, ease: 'power2.out' });
                }}
                onMouseLeave={e => {
                  const arrow = e.currentTarget.querySelector('.arrow') as HTMLElement;
                  if (arrow) gsap.to(arrow, { x: 0, duration: 0.25, ease: 'power2.in' });
                }}
              >
                {svc.cta}
                <span className="arrow" style={{ fontSize: 14, lineHeight: 1 }}>→</span>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
cd client && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add client/src/app/components/Services.tsx
git commit -m "feat: add Services two-card section with GSAP arrow hover"
```

---

## Task 7: About section redesign

**Files:**
- Modify: `client/src/app/components/About.tsx`

- [ ] **Step 1: Replace About.tsx**

Replace the entire contents of `client/src/app/components/About.tsx`:

```tsx
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const KAY_PHOTO = 'https://images.unsplash.com/photo-1618661148759-0d481c0c2116?w=800&q=80';

export function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const nameRef    = useRef<HTMLHeadingElement>(null);
  const lineRef    = useRef<HTMLDivElement>(null);
  const textRef    = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      // Masked name reveal
      if (nameRef.current) {
        gsap.from(nameRef.current, {
          y: 60, opacity: 0, duration: 1.0,
          ease: 'power3.out',
          scrollTrigger: { trigger: nameRef.current, start: 'top 82%' },
        });
      }
      // Rule line draw
      if (lineRef.current) {
        gsap.from(lineRef.current, {
          scaleX: 0, transformOrigin: 'left center', duration: 1.0,
          ease: 'power3.inOut',
          scrollTrigger: { trigger: lineRef.current, start: 'top 82%' },
        });
      }
      // Text block fade
      if (textRef.current) {
        gsap.from(textRef.current, {
          y: 30, opacity: 0, duration: 0.9,
          ease: 'power3.out', delay: 0.2,
          scrollTrigger: { trigger: textRef.current, start: 'top 82%' },
        });
      }
      // Photo slide in from left
      gsap.from('.about-photo', {
        x: -40, opacity: 0, duration: 1.0,
        ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 78%' },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      id="about"
      ref={sectionRef}
      style={{
        background: '#fff', padding: '120px 0',
        fontFamily: "'Helvetica Neue', Arial, sans-serif",
      }}
    >
      <div style={{
        maxWidth: 1200, margin: '0 auto', padding: '0 32px',
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80,
        alignItems: 'center',
      }}
        className="sm:grid-cols-1"
      >

        {/* Left — photo */}
        <div className="about-photo" style={{ position: 'relative' }}>
          <div style={{
            aspectRatio: '3/4', overflow: 'hidden',
            background: '#f5f5f5',
          }}>
            <img
              src={KAY_PHOTO}
              alt="Kay Tubillla — photographer"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </div>
        </div>

        {/* Right — text */}
        <div>
          <p style={{
            fontSize: 10, letterSpacing: '0.25em', textTransform: 'uppercase',
            color: '#888', marginBottom: 24, fontWeight: 500,
          }}>
            About
          </p>

          <h2
            ref={nameRef}
            style={{
              fontSize: 'clamp(36px, 4.5vw, 56px)', fontWeight: 300,
              color: '#111', letterSpacing: '-0.02em', margin: '0 0 24px 0',
              lineHeight: 1.1,
            }}
          >
            Kay Tubillla
          </h2>

          <div
            ref={lineRef}
            style={{ width: '100%', maxWidth: 64, height: 1, background: '#111', marginBottom: 32 }}
          />

          <div ref={textRef}>
            <p style={{
              fontSize: 15, lineHeight: 1.85, color: '#555', marginBottom: 20, fontWeight: 400,
            }}>
              Based in Oxford, Kay has spent years developing a quiet, precise approach to photography
              — one that puts subjects at ease and captures genuinely unguarded moments.
            </p>
            <p style={{
              fontSize: 15, lineHeight: 1.85, color: '#555', marginBottom: 32, fontWeight: 400,
            }}>
              From intimate wedding ceremonies at the Bodleian to portrait sessions in Port Meadow,
              every project is approached with the same attention: careful light, honest framing,
              and an edit that serves the story rather than the trend.
            </p>
            <p style={{
              fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase',
              color: '#888', fontWeight: 500,
            }}>
              Oxford & Surrounding Area
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
cd client && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add client/src/app/components/About.tsx
git commit -m "feat: rebuild About — two-column, GSAP name + line + text reveals"
```

---

## Task 8: Footer redesign

**Files:**
- Modify: `client/src/app/components/Footer.tsx`

- [ ] **Step 1: Replace Footer.tsx**

Replace the entire contents of `client/src/app/components/Footer.tsx`:

```tsx
export function Footer() {
  return (
    <footer
      id="contact"
      style={{
        background: '#111', color: '#fff',
        fontFamily: "'Helvetica Neue', Arial, sans-serif",
      }}
    >
      {/* Main footer bar */}
      <div style={{
        maxWidth: 1200, margin: '0 auto', padding: '48px 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 24,
      }}>
        <span style={{
          fontSize: 13, fontWeight: 500, letterSpacing: '0.1em',
          textTransform: 'uppercase',
        }}>
          Kay Tubillla Photography
        </span>

        <a
          href="mailto:hello@kaytubillla.com"
          style={{
            fontSize: 13, color: 'rgba(255,255,255,0.6)',
            textDecoration: 'none', letterSpacing: '0.02em',
            transition: 'color 0.2s',
          }}
          onMouseEnter={e => ((e.target as HTMLAnchorElement).style.color = '#fff')}
          onMouseLeave={e => ((e.target as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.6)')}
        >
          hello@kaytubillla.com
        </a>

        <span style={{
          fontSize: 11, color: 'rgba(255,255,255,0.4)',
          letterSpacing: '0.05em',
        }}>
          © {new Date().getFullYear()} Kay Tubillla
        </span>
      </div>
    </footer>
  );
}
```

Note: The footer has `id="contact"` so the Header nav's "Contact" scroll link lands here.

- [ ] **Step 2: Commit**

```bash
git add client/src/app/components/Footer.tsx
git commit -m "feat: rebuild Footer — simple black bar with name, email, copyright"
```

---

## Task 9: Wire up App.tsx — add Cursor, swap sections

**Files:**
- Modify: `client/src/app/App.tsx`

- [ ] **Step 1: Read the current App.tsx to confirm imports**

The current imports include Header, Hero, Portfolio, Packages, About, Contact, Footer. Packages and Contact are being removed from `HomePage`.

- [ ] **Step 2: Replace App.tsx**

Replace the entire contents of `client/src/app/App.tsx`:

```tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ServiceAreaPage } from './pages/ServiceAreaPage';
import { ServiceAreaEditor } from './components/admin/ServiceAreaEditor';
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

// Placeholder pages — replaced in later plans
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

          {/* Admin routes (Kay only) */}
          <Route path="/admin" element={
            <ProtectedRoute requireStaff>
              <ComingSoon label="Admin Dashboard" />
            </ProtectedRoute>
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

- [ ] **Step 3: Full build verification**

```bash
cd client
npm run build
```

Expected: build completes with no errors. The bundle will be larger due to GSAP + leaflet — that's fine.

- [ ] **Step 4: Run Django check to confirm backend is still OK**

```bash
cd server
venv/Scripts/python manage.py check
venv/Scripts/python manage.py test content.tests accounts.tests -v 0
```

Expected: no issues, all tests pass.

- [ ] **Step 5: Commit**

```bash
git add client/src/app/App.tsx
git commit -m "feat: wire up Cursor, Services, redesigned homepage sections"
```

---

## Self-Review

**Spec coverage:**
- ✅ §2 Visual identity — monochrome throughout; Helvetica Neue/Arial; weights 300/400/500
- ✅ §2 Custom cursor — dot + ring, desktop only, GSAP quickTo
- ✅ §2 Hero slideshow — 4 photos, 4s interval, GSAP crossfade+scale, dot indicators, scroll hint
- ✅ §2 Scroll-triggered reveals — stagger on portfolio grid, name + line draw on About
- ✅ §2 Hover interactions — portfolio scale-down, service arrow slide
- ✅ §4 Nav — frosted bar, scroll links (Portfolio/Services/About/Contact), Book/Editing CTAs, Log In/Register
- ✅ §4 Hero text — Oxford eyebrow, name, tagline, two CTAs
- ✅ §4 Portfolio — category filter, 3-column grid, API-connected with placeholder fallback
- ✅ §4 Services — two cards (Photography/Editing), numbered, arrow links
- ✅ §4 About — two-column photo+text, Kay's details, Oxford context
- ✅ §4 Footer — black bar with name, email, copyright; doubles as contact anchor
- ✅ §13 GET /api/portfolio/ — public endpoint added
- ⏭ §5 Booking flow (/book) — Plan 3
- ⏭ §6 Editing flow (/editing) — Plan 3
- ⏭ §7 Messaging — Plan 4
- ⏭ §8 Admin section — Plan 4

**Placeholder scan:** No TBDs. All code blocks are complete. Placeholder images (Unsplash) used for Hero and About where Kay's real photos are not yet available.

**Type consistency:**
- `PortfolioItem` interface defined in Portfolio.tsx and matches what `portfolio_list` view returns
- `GSAP` imports consistent: `import gsap from 'gsap'` + `import { ScrollTrigger } from 'gsap/ScrollTrigger'` in each file that needs it
- `gsap.registerPlugin(ScrollTrigger)` called at module level in each file using it
- `slideRefs.current[i]` typed as `(HTMLDivElement | null)[]`
