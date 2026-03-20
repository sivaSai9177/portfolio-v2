import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { splitText } from '../../lib/splitText';

gsap.registerPlugin(ScrollTrigger);

export const Impact = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const statRefs = useRef<(HTMLDivElement | null)[]>([]);
  const achievementCardsRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate section label
      if (labelRef.current) {
        const chars = splitText(labelRef.current);
        gsap.from(chars, {
          opacity: 0,
          y: 10,
          duration: 0.6,
          stagger: 0.03,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: labelRef.current,
            start: 'top center+=150',
            toggleActions: 'play none none none',
          },
        });
      }

      // Animate stat counters
      const statTargets = [90, 60, 20, 2];
      statRefs.current.forEach((el, idx) => {
        if (el) {
          const counter = { val: 0 };
          gsap.to(counter, {
            val: statTargets[idx],
            duration: 2,
            ease: 'power2.out',
            snap: { val: 1 },
            scrollTrigger: {
              trigger: el,
              start: 'top center+=150',
              toggleActions: 'play none none none',
            },
            onUpdate: () => {
              if (el) el.textContent = String(Math.round(counter.val));
            },
          });
        }
      });

      // Animate achievement cards
      if (achievementCardsRef.current) {
        const cards = achievementCardsRef.current.querySelectorAll('.sc-impact-achievement-card');
        gsap.from(cards, {
          opacity: 0,
          y: 30,
          duration: 0.8,
          stagger: 0.15,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: achievementCardsRef.current,
            start: 'top center+=100',
            toggleActions: 'play none none none',
          },
        });
      }

      // Animate timeline items
      if (timelineRef.current) {
        const timelineItems = timelineRef.current.querySelectorAll('.sc-impact-timeline-item');
        gsap.from(timelineItems, {
          opacity: 0,
          x: (i) => (i === 0 ? -40 : 40),
          duration: 0.8,
          stagger: 0.2,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: timelineRef.current,
            start: 'top center+=100',
            toggleActions: 'play none none none',
          },
        });
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="sc-impact" ref={containerRef}>
      <div className="sc-section-label" ref={labelRef}>
        <span className="material-icons-round">emoji_events</span>
        The Impact
      </div>

      <p className="sc-impact-narrative">
        Over 20 months spanning two companies, I transformed how teams build and scale
        data-driven interfaces. At Nubewell Networks, I established the foundational
        architecture—layout systems, component libraries, and visualization toolkits from
        zero. At Sechpoint, I modernized that foundation at scale, migrating 90+ components
        to declarative data fetching and optimizing performance for high-frequency analytics.
        This journey demonstrates both individual execution and the multiplier effect of
        architectural decisions.
      </p>

      <div className="sc-impact-stats">
        <div className="sc-impact-stat">
          <div className="sc-impact-stat-number" ref={(el) => {
            if (el) statRefs.current[0] = el;
          }}>
            0
          </div>
          <div className="sc-impact-stat-label">Components Built</div>
        </div>
        <div className="sc-impact-stat">
          <div className="sc-impact-stat-number" ref={(el) => {
            if (el) statRefs.current[1] = el;
          }}>
            0
          </div>
          <div className="sc-impact-stat-label">Routes Shipped</div>
        </div>
        <div className="sc-impact-stat">
          <div className="sc-impact-stat-number" ref={(el) => {
            if (el) statRefs.current[2] = el;
          }}>
            0
          </div>
          <div className="sc-impact-stat-label">Config Pages</div>
        </div>
        <div className="sc-impact-stat">
          <div className="sc-impact-stat-number" ref={(el) => {
            if (el) statRefs.current[3] = el;
          }}>
            0
          </div>
          <div className="sc-impact-stat-label">Companies</div>
        </div>
      </div>

      <div className="sc-impact-achievements" ref={achievementCardsRef}>
        <div className="sc-impact-achievement-card">
          <span className="sc-impact-achievement-icon material-icons-round">swap_horiz</span>
          <h3 className="sc-impact-achievement-title">Legacy → Modern Migration</h3>
          <p className="sc-impact-achievement-desc">
            Single-handedly migrated the entire data-fetching layer from imperative useEffect
            to declarative TanStack Query across 90+ components — establishing caching,
            background refetching, and optimistic patterns as the new standard.
          </p>
        </div>

        <div className="sc-impact-achievement-card">
          <span className="sc-impact-achievement-icon material-icons-round">foundation</span>
          <h3 className="sc-impact-achievement-title">Zero-to-One Architecture</h3>
          <p className="sc-impact-achievement-desc">
            Built the application's layout, navigation system, and reusable component library
            from day one — the foundational layer that a 3-person team shipped every feature
            on top of.
          </p>
        </div>

        <div className="sc-impact-achievement-card">
          <span className="sc-impact-achievement-icon material-icons-round">speed</span>
          <h3 className="sc-impact-achievement-title">Performance at Scale</h3>
          <p className="sc-impact-achievement-desc">
            Reduced initial load time through route-level code splitting (60+ lazy routes)
            and optimized rendering of analytics dashboards handling high-frequency network
            telemetry.
          </p>
        </div>

        <div className="sc-impact-achievement-card">
          <span className="sc-impact-achievement-icon material-icons-round">bar_chart</span>
          <h3 className="sc-impact-achievement-title">Team-wide Chart System</h3>
          <p className="sc-impact-achievement-desc">
            Designed a reusable, themeable visualization toolkit that became the standard
            for all data visualization across dashboards, reports, and analytics modules.
          </p>
        </div>
      </div>

      <div className="sc-impact-timeline" ref={timelineRef}>
        <div className="sc-impact-timeline-item sc-impact-timeline-left">
          <div className="sc-impact-timeline-company">
            <h3 className="sc-impact-timeline-title">Nubewell Networks</h3>
            <p className="sc-impact-timeline-period">Mar 2024 – Mar 2025</p>
          </div>
          <p className="sc-impact-timeline-description">
            Built from zero: layout, nav, component library, chart system, 20+ config pages
          </p>
        </div>

        <div className="sc-impact-timeline-item sc-impact-timeline-right">
          <div className="sc-impact-timeline-company">
            <h3 className="sc-impact-timeline-title">Sechpoint</h3>
            <p className="sc-impact-timeline-period">Mar 2025 – Nov 2025</p>
          </div>
          <p className="sc-impact-timeline-description">
            Modernized at scale: TanStack Query migration, Zustand state, code splitting,
            advanced data grids
          </p>
        </div>
      </div>
    </section>
  );
};
