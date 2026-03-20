import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { splitText } from '../../lib/splitText';

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    number: '01',
    icon: 'grid_view',
    title: 'Dynamic Data Grids',
    narrative:
      'Managing 10,000+ network devices meant the UI had to handle massive datasets without freezing. I built a server-side data grid system that virtualizes rows, supports inline editing, and streams updates in real time.',
    desc:
      'MUI X Data Grid with server-side sorting, filtering, and pagination — virtualized rendering for thousands of rows with real-time WebSocket updates and optimistic inline editing.',
    tags: ['MUI X Data Grid', 'Server-side Ops', 'Virtualization', 'WebSocket'],
    img: 'assets/work/mockups/mockup-dashboard-dark.png',
    url: 'app.sechpoint.io/devices',
  },
  {
    number: '02',
    icon: 'monitoring',
    title: 'Composable Chart System',
    narrative:
      'Security analytics demands real-time visibility. I designed a themeable, composable chart toolkit that the entire team adopted — from bandwidth heatmaps to threat-detection timelines.',
    desc:
      'Recharts-based visualization system with WebSocket integration for real-time metric streaming. Themeable, responsive, and reusable across dashboards, reports, and analytics modules.',
    tags: ['Recharts', 'Real-time Data', 'WebSocket', 'Themeable'],
    img: 'assets/work/mockups/mockup-analytics-dark.png',
    url: 'app.sechpoint.io/analytics',
  },
  {
    number: '03',
    icon: 'tune',
    title: 'Configuration Management',
    narrative:
      '20+ security policy types — each with unique validation rules, nested fields, and conditional logic. I built a dynamic form engine powered by Zod schemas that auto-generates entire config pages.',
    desc:
      'Dynamic configuration pages powered by Zod validation with auto-generated forms for complex security policies — firewall rules, access controls, VPN configs, and device profiles.',
    tags: ['Zod Validation', 'Dynamic Forms', '20+ Pages', 'Auto-gen UI'],
    img: 'assets/work/mockups/mockup-plan-policy-dark.png',
    url: 'app.sechpoint.io/policies/firewall',
  },
];

export default function Features() {
  const containerRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const imgRefs = useRef<(HTMLDivElement | null)[]>([]);

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

      const validCards = cardsRef.current.filter((card) => card !== null);
      if (validCards.length > 0) {
        timeline.to(
          validCards,
          { opacity: 1, scale: 1, duration: 0.7, stagger: 0.12, ease: 'back.out(1.2)' },
          0.2
        );
      }

      // Parallax on feature images — image scrolls slower than text
      imgRefs.current.forEach((img) => {
        if (!img) return;
        gsap.to(img, {
          y: -30,
          ease: 'none',
          scrollTrigger: {
            trigger: img,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
          },
        });
      });

      // Floating animation on browser frames
      imgRefs.current.forEach((img, i) => {
        if (!img) return;
        gsap.to(img, {
          y: '+=8',
          duration: 3 + i * 0.5,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
          delay: i * 0.3,
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="sc-features">
      <div className="sc-section-inner">
        <div ref={labelRef} className="sc-section-label">
          <span className="material-icons-round">dashboard</span>
          What I Built
        </div>

        <div className="sc-features-grid">
          {features.map((feature, i) => (
            <div
              key={feature.number}
              ref={(el) => { cardsRef.current[i] = el; }}
              className="sc-feature-card"
            >
              <div
                className="sc-feature-img"
                ref={(el) => { imgRefs.current[i] = el; }}
              >
                <img
                  src={feature.img}
                  alt={feature.title}
                  className="sc-feature-mockup-img"
                  loading="lazy"
                />
              </div>
              <div className="sc-feature-body">
                <span className="sc-feature-number">{feature.number}</span>
                <h3 className="sc-feature-title">
                  <span className="material-icons-round sc-feature-icon">{feature.icon}</span>
                  {feature.title}
                </h3>
                <p className="sc-feature-narrative">{feature.narrative}</p>
                <p className="sc-feature-desc">{feature.desc}</p>
                <div className="sc-feature-tags">
                  {feature.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
