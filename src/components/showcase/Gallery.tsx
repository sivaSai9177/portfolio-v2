import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { splitText } from '../../lib/splitText';

gsap.registerPlugin(ScrollTrigger);

interface GalleryItem {
  id: number;
  src: string;          // original screenshot (for lightbox full-res)
  mockupSrc: string;    // pre-rendered mockup composite
  caption: string;
  description: string;
  layout: 'hero' | 'duo' | 'featured' | 'wide';
}

const galleryItems: GalleryItem[] = [
  {
    id: 1,
    src: 'assets/work/project-dashboard-1.png',
    mockupSrc: 'assets/work/mockups/mockup-dashboard-dark.png',
    caption: 'Performance Dashboard',
    description: 'Real-time network performance analytics with interactive charts and device health monitoring.',
    layout: 'hero',
  },
  {
    id: 2,
    src: 'assets/work/project-devices.png',
    mockupSrc: 'assets/work/mockups/mockup-devices-clay.png',
    caption: 'Device Management',
    description: 'Manage 10K+ network devices with virtualized grids, inline editing, and group management.',
    layout: 'hero',
  },
  {
    id: 3,
    src: 'assets/work/project-dashboard-2.png',
    mockupSrc: 'assets/work/mockups/mockup-analytics-dark.png',
    caption: 'Analytics Dashboard',
    description: 'Deep-packet inspection analytics with real-time WebSocket streaming and custom reports.',
    layout: 'duo',
  },
  {
    id: 4,
    src: 'assets/work/project-url-upload.png',
    mockupSrc: 'assets/work/mockups/mockup-url-upload-air.png',
    caption: 'URL File Upload',
    description: 'Bulk URL list management with file upload, validation, and policy assignment.',
    layout: 'featured',
  },
  {
    id: 5,
    src: 'assets/work/project-app-groups.png',
    mockupSrc: 'assets/work/mockups/mockup-app-groups-clay.png',
    caption: 'App Group Policies',
    description: 'Application grouping and policy management for granular traffic control.',
    layout: 'duo',
  },
  {
    id: 6,
    src: 'assets/work/project-plan-policy.png',
    mockupSrc: 'assets/work/mockups/mockup-plan-policy-dark.png',
    caption: 'Plan & Policy Config',
    description: 'Dynamic policy configuration with Zod-validated forms and nested rule hierarchies.',
    layout: 'wide',
  },
];

export default function Gallery() {
  const containerRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<(HTMLDivElement | null)[]>([]);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const lightboxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (!containerRef.current) return;

      if (labelRef.current) {
        splitText(labelRef.current, 'char');
      }

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top center+=100',
          toggleActions: 'play none none reverse',
        },
      });

      const labelChars = labelRef.current?.querySelectorAll('.char');
      if (labelChars && labelChars.length > 0) {
        timeline.to(labelChars, { opacity: 1, duration: 0.4, stagger: 0.02, ease: 'power2.out' }, 0);
      }

      // Staggered entry for gallery items
      const validItems = itemsRef.current.filter((item) => item !== null);
      if (validItems.length > 0) {
        timeline.to(
          validItems,
          {
            opacity: 1,
            y: 0,
            rotation: 0,
            duration: 0.8,
            stagger: 0.1,
            ease: 'power3.out',
          },
          0.2
        );
      }

      // Subtle floating animation
      validItems.forEach((item, i) => {
        gsap.to(item, {
          y: '+=5',
          duration: 3.5 + i * 0.3,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
          delay: i * 0.15,
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isLightboxOpen) return;
      if (e.key === 'ArrowLeft') setCurrentIndex((p) => (p === 0 ? galleryItems.length - 1 : p - 1));
      else if (e.key === 'ArrowRight') setCurrentIndex((p) => (p === galleryItems.length - 1 ? 0 : p + 1));
      else if (e.key === 'Escape') setIsLightboxOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen]);

  // Lightbox animation
  useEffect(() => {
    if (isLightboxOpen && lightboxRef.current) {
      gsap.to(lightboxRef.current, { autoAlpha: 1, duration: 0.3, ease: 'power2.out' });
    }
  }, [isLightboxOpen]);

  const openLightbox = (index: number) => { setCurrentIndex(index); setIsLightboxOpen(true); };
  const closeLightbox = () => setIsLightboxOpen(false);
  const goToPrevious = () => setCurrentIndex((p) => (p === 0 ? galleryItems.length - 1 : p - 1));
  const goToNext = () => setCurrentIndex((p) => (p === galleryItems.length - 1 ? 0 : p + 1));

  const currentImage = galleryItems[currentIndex];

  // Group items by layout rows
  const heroItems = galleryItems.filter((i) => i.layout === 'hero');
  const duoItems = galleryItems.filter((i) => i.layout === 'duo');
  const featuredItems = galleryItems.filter((i) => i.layout === 'featured');
  const wideItems = galleryItems.filter((i) => i.layout === 'wide');

  function renderItem(item: GalleryItem, className?: string) {
    const idx = galleryItems.findIndex((g) => g.id === item.id);
    return (
      <div
        key={item.id}
        ref={(el) => { itemsRef.current[idx] = el; }}
        className={`sc-gallery-perspective ${className || ''}`}
        style={{ opacity: 0, transform: 'translateY(50px)' }}
      >
        <div className="sc-gallery-mockup" onClick={() => openLightbox(idx)}>
          <img
            src={item.mockupSrc}
            alt={item.caption}
            className="sc-gallery-mockup-img"
            loading="lazy"
          />
        </div>
        <div className="sc-gallery-item-caption">
          <h4>{item.caption}</h4>
          <p>{item.description}</p>
        </div>
      </div>
    );
  }

  return (
    <section ref={containerRef} className="sc-gallery">
      <div className="sc-section-inner">
        <div ref={labelRef} className="sc-section-label">
          <span className="material-icons-round">photo_library</span>
          Project Showcase
        </div>

        <div className="sc-gallery-showcase">
          {/* Row 1: Hero pair — dark + clay MacBook side-by-side */}
          <div className="sc-gallery-row sc-gallery-row--hero">
            {heroItems.map((item) => renderItem(item))}
          </div>

          {/* Row 2: Duo — two items side-by-side */}
          <div className="sc-gallery-row sc-gallery-row--duo">
            {duoItems.map((item) => renderItem(item))}
          </div>

          {/* Row 3: Featured — single centered spotlight */}
          <div className="sc-gallery-row sc-gallery-row--featured">
            {featuredItems.map((item) => renderItem(item, 'sc-gallery-perspective--featured-laptop'))}
          </div>

          {/* Row 4: Full-width wide */}
          <div className="sc-gallery-row sc-gallery-row--wide">
            {wideItems.map((item) => renderItem(item, 'sc-gallery-perspective--wide'))}
          </div>
        </div>
      </div>

      {/* Lightbox — shows original full-res screenshot */}
      <div
        ref={lightboxRef}
        className="sc-gallery-lightbox"
        hidden={!isLightboxOpen}
        style={{ opacity: 0 }}
      >
        <div className="sc-lightbox-backdrop" onClick={closeLightbox} style={{ opacity: isLightboxOpen ? 1 : 0 }} />
        {currentImage && (
          <div className="sc-lightbox-content">
            <img src={currentImage.src} alt={currentImage.caption} className="sc-lightbox-img" />
            <div className="sc-lightbox-info" style={{ opacity: isLightboxOpen ? 1 : 0 }}>
              <span className="sc-lightbox-caption">{currentImage.caption}</span>
              <span className="sc-lightbox-counter">{currentIndex + 1} / {galleryItems.length}</span>
            </div>
          </div>
        )}
        <button className="sc-lightbox-close" onClick={closeLightbox} aria-label="Close lightbox" style={{ opacity: isLightboxOpen ? 1 : 0 }}>
          <span className="material-icons-round">close</span>
        </button>
        <button className="sc-lightbox-prev" onClick={goToPrevious} aria-label="Previous image" style={{ opacity: isLightboxOpen ? 1 : 0 }}>
          <span className="material-icons-round">arrow_back</span>
        </button>
        <button className="sc-lightbox-next" onClick={goToNext} aria-label="Next image" style={{ opacity: isLightboxOpen ? 1 : 0 }}>
          <span className="material-icons-round">arrow_forward</span>
        </button>
      </div>
    </section>
  );
}
