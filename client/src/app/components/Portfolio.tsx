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
          className="portfolio-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 12,
          }}
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
