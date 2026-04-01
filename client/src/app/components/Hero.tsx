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
