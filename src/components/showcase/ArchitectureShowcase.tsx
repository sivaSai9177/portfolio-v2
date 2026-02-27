import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
// Uses pre-rendered mockup image

gsap.registerPlugin(ScrollTrigger);

const annotations = [
  {
    label: 'Real-time Data Grid',
    text: '10K+ rows, virtualized MUI X grid with server-side ops',
    icon: 'grid_view',
    position: 'top-left' as const,
  },
  {
    label: 'WebSocket Telemetry',
    text: 'Live metric streaming with Socket.io — zero polling',
    icon: 'sensors',
    position: 'top-right' as const,
  },
  {
    label: 'Route-level Splitting',
    text: '60+ lazy-loaded routes — React.lazy + Suspense',
    icon: 'route',
    position: 'bottom-left' as const,
  },
  {
    label: 'Zustand State Layer',
    text: 'Typed stores replace prop drilling & sessionStorage',
    icon: 'hub',
    position: 'bottom-right' as const,
  },
];

export default function ArchitectureShowcase() {
  const containerRef = useRef<HTMLDivElement>(null);
  const browserRef = useRef<HTMLDivElement>(null);
  const calloutsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (!containerRef.current) return;

      // Browser frame entrance with perspective
      if (browserRef.current) {
        gsap.from(browserRef.current, {
          opacity: 0,
          rotateX: 8,
          y: 60,
          scale: 0.95,
          duration: 1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top center+=50',
            toggleActions: 'play none none reverse',
          },
        });

        // Scroll-driven perspective tilt
        gsap.to(browserRef.current, {
          rotateX: -2,
          ease: 'none',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top center',
            end: 'bottom center',
            scrub: 1,
          },
        });
      }

      // Stagger callouts in
      const validCallouts = calloutsRef.current.filter((c) => c !== null);
      if (validCallouts.length > 0) {
        gsap.from(validCallouts, {
          opacity: 0,
          y: 30,
          scale: 0.9,
          duration: 0.6,
          stagger: 0.15,
          ease: 'back.out(1.2)',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top center',
            toggleActions: 'play none none reverse',
          },
        });

        // Floating animation for each callout
        validCallouts.forEach((callout, i) => {
          gsap.to(callout, {
            y: '+=6',
            duration: 2.5 + i * 0.4,
            ease: 'sine.inOut',
            repeat: -1,
            yoyo: true,
            delay: i * 0.3,
          });
        });
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="sc-arch-showcase">
      <div className="sc-arch-showcase-inner">
        <div className="sc-arch-showcase-label">
          <span className="material-icons-round">architecture</span>
          Under the Hood
        </div>

        <div className="sc-arch-showcase-viewport" style={{ perspective: '1200px' }}>
          <div ref={browserRef} className="sc-arch-showcase-browser" style={{ transformStyle: 'preserve-3d' }}>
            <img
              src="assets/work/mockups/mockup-dashboard-dark.png"
              alt="SechPoint Dashboard — Architecture Overview"
              className="sc-arch-showcase-img"
              loading="lazy"
            />
          </div>

          {/* Annotation callouts */}
          {annotations.map((ann, i) => (
            <div
              key={ann.label}
              ref={(el) => { calloutsRef.current[i] = el; }}
              className={`sc-arch-callout sc-arch-callout--${ann.position}`}
            >
              <div className="sc-arch-callout-connector" />
              <div className="sc-arch-callout-card">
                <span className="material-icons-round sc-arch-callout-icon">{ann.icon}</span>
                <div>
                  <h4 className="sc-arch-callout-label">{ann.label}</h4>
                  <p className="sc-arch-callout-text">{ann.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
