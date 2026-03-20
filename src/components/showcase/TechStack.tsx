import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { splitText } from '../../lib/splitText';

gsap.registerPlugin(ScrollTrigger);

const techGroups = [
  {
    title: 'Frontend Core',
    icon: 'code',
    items: [
      { name: 'React 18', why: 'Concurrent rendering for complex UIs', hl: false },
      { name: 'TypeScript', why: 'Type-safe across 90+ components', hl: false },
      { name: 'Vite', why: 'Sub-second HMR, 10x faster builds', hl: true },
    ],
  },
  {
    title: 'UI Framework',
    icon: 'palette',
    items: [
      { name: 'Material UI', why: 'Enterprise design system foundation', hl: false },
      { name: 'MUI X', why: 'Advanced data grids for 10K+ rows', hl: true },
      { name: 'Tailwind CSS', why: 'Utility-first for rapid iteration', hl: false },
    ],
  },
  {
    title: 'State & Data',
    icon: 'hub',
    items: [
      { name: 'TanStack Query', why: 'Replaced 90+ useEffect fetch patterns', hl: true },
      { name: 'Zustand', why: 'Replaced prop drilling & sessionStorage', hl: false },
      { name: 'Zod', why: 'Runtime validation for 20+ config schemas', hl: false },
    ],
  },
  {
    title: 'Visualization',
    icon: 'bar_chart',
    items: [
      { name: 'Recharts', why: 'Composable, themeable chart system', hl: false },
      { name: 'WebSocket', why: 'Real-time telemetry streaming', hl: true },
      { name: 'Three.js', why: '3D visualization & immersive UIs', hl: false },
    ],
  },
  {
    title: 'Quality & DX',
    icon: 'verified',
    items: [
      { name: 'ESLint', why: 'Consistent code quality across team', hl: false },
      { name: 'Vitest', why: 'Fast unit testing with Vite integration', hl: false },
      { name: 'TanStack Router', why: 'Type-safe routing for 60+ routes', hl: true },
    ],
  },
];

export default function TechStack() {
  const containerRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const beforeRef = useRef<HTMLDivElement>(null);
  const afterRef = useRef<HTMLDivElement>(null);
  const groupsRef = useRef<(HTMLDivElement | null)[]>([]);

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

      // Animate before/after comparison
      if (beforeRef.current) {
        timeline.to(beforeRef.current, { opacity: 1, x: 0, duration: 0.6, ease: 'power2.out' }, 0.2);
      }
      if (afterRef.current) {
        timeline.to(afterRef.current, { opacity: 1, x: 0, duration: 0.6, ease: 'power2.out' }, 0.35);
      }

      // Animate tech groups
      const validGroups = groupsRef.current.filter((g) => g !== null);
      if (validGroups.length > 0) {
        timeline.to(
          validGroups,
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out' },
          0.5
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="sc-tech">
      <div className="sc-section-inner">
        <div ref={labelRef} className="sc-section-label">
          <span className="material-icons-round">memory</span>
          The Architecture
        </div>

        {/* Before → After comparison */}
        <div className="sc-arch-comparison">
          <div ref={beforeRef} className="sc-arch-card sc-arch-card--before" style={{ opacity: 0, transform: 'translateX(-30px)' }}>
            <div className="sc-arch-card-header">
              <span className="material-icons-round" style={{ color: '#f85149' }}>warning</span>
              <h3>Before</h3>
            </div>
            <ul className="sc-arch-list">
              <li><span className="material-icons-round">close</span> useEffect for every API call — race conditions everywhere</li>
              <li><span className="material-icons-round">close</span> Props drilled 5+ levels, sessionStorage as state</li>
              <li><span className="material-icons-round">close</span> Monolithic bundle — all 60+ routes in one chunk</li>
              <li><span className="material-icons-round">close</span> No shared components — every dev rebuilding from scratch</li>
            </ul>
          </div>

          <div className="sc-arch-arrow">
            <span className="material-icons-round">arrow_forward</span>
          </div>

          <div ref={afterRef} className="sc-arch-card sc-arch-card--after" style={{ opacity: 0, transform: 'translateX(30px)' }}>
            <div className="sc-arch-card-header">
              <span className="material-icons-round" style={{ color: 'var(--accent)' }}>check_circle</span>
              <h3>After</h3>
            </div>
            <ul className="sc-arch-list">
              <li><span className="material-icons-round">check</span> TanStack Query — declarative fetching, caching, background sync</li>
              <li><span className="material-icons-round">check</span> Zustand stores — typed, predictable, zero prop drilling</li>
              <li><span className="material-icons-round">check</span> React.lazy + Suspense — route-level code splitting</li>
              <li><span className="material-icons-round">check</span> 90+ shared components — the foundation the team ships on</li>
            </ul>
          </div>
        </div>

        {/* Tech stack with "why" context */}
        <div className="sc-tech-grid">
          {techGroups.map((group, gi) => (
            <div
              key={group.title}
              ref={(el) => { groupsRef.current[gi] = el; }}
              className="sc-tech-group"
              style={{ opacity: 0, transform: 'translateY(20px)' }}
            >
              <div className="sc-tech-group-title">
                <span className="material-icons-round">{group.icon}</span>
                {group.title}
              </div>
              <div className="sc-tech-pills">
                {group.items.map((item) => (
                  <div key={item.name} className={`sc-tech-pill${item.hl ? ' sc-tech-pill--hl' : ''}`}>
                    <span className="sc-tech-pill-name">{item.name}</span>
                    <span className="sc-tech-pill-why">{item.why}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
