import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { splitText } from '../../lib/splitText';

gsap.registerPlugin(ScrollTrigger);

interface ExperienceItem {
  id: string;
  company: string;
  role: string;
  meta: string;
  dates: string;
  narrative: string;
  points: string[];
  tags: string[];
}

const experiences: ExperienceItem[] = [
  {
    id: 'sechpoint',
    company: 'Sechpoint Pvt Limited',
    role: 'Frontend Developer',
    meta: 'Cybersecurity \u00b7 Product Engineering \u00b7 Bangalore',
    dates: 'Mar 2025 \u2014 Nov 2025',
    narrative:
      'The product was functional but the frontend was held together by imperative patterns \u2014 useEffect-driven API calls, prop drilling, and a monolithic bundle. I took ownership of modernizing the entire architecture.',
    points: [
      'Migrated 90+ components from useEffect to <strong>TanStack React Query</strong> \u2014 eliminating race conditions and introducing server-state caching',
      'Designed centralized state with <strong>Zustand</strong>, replacing scattered sessionStorage and prop-drilling',
      'Implemented code splitting with <strong>React.lazy</strong> across 60+ routes, cutting initial bundle size',
      'Built dynamic <strong>MUI X Data Grid</strong> interfaces with server-side sorting, filtering, and inline actions',
      'Introduced <strong>animations, collapsible tables</strong>, and restructured the entire project architecture',
    ],
    tags: ['React 19', 'TypeScript', 'TanStack Query', 'Zustand', 'MUI v7', 'MUI X Data Grid', 'Zod', 'Vite'],
  },
  {
    id: 'nubewell',
    company: 'Nubewell Networks',
    role: 'Frontend Developer',
    meta: 'Cybersecurity \u00b7 3-person Frontend Team \u00b7 Bangalore',
    dates: 'Mar 2024 \u2014 Mar 2025',
    narrative:
      'This is where I built everything from zero. My role was to lay the structural foundation \u2014 layout, navigation, component library, and charting system \u2014 so the rest of the team could ship features on a stable base.',
    points: [
      'Architected the <strong>application shell from scratch</strong> \u2014 responsive layout, sidebar with nested drawer menus, protected routing, and theme infrastructure',
      'Built a <strong>shared component library</strong>: form controls, tables, skeleton loaders, toast notifications, error boundaries, modals',
      'Owned the <strong>Config module end-to-end</strong> \u2014 20+ configuration pages spanning firewall policies, rate limiting, subscriber management',
      'Engineered a <strong>composable chart system</strong> with Recharts \u2014 bar, area, stacked area \u2014 adopted as the team standard',
      'Shipped <strong>dark/light theme switching</strong> with custom ThemeContext and MUI overrides',
    ],
    tags: ['React', 'TypeScript', 'Material UI', 'Recharts', 'Axios', 'React Router', 'Socket.io', 'Vite'],
  },
];

export default function Experience() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      // Section label char reveal
      const sectionLabel = sectionRef.current!.querySelector('.experience .section-label .reveal-heading');
      if (sectionLabel) {
        const labelChars = splitText(sectionLabel as HTMLElement, 'char');
        gsap.to(labelChars, {
          opacity: 1,
          y: 0,
          rotateX: 0,
          duration: 0.5,
          stagger: 0.02,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.experience',
            start: 'top 75%',
            toggleActions: 'play none none reverse',
          },
        });
      }

      // Timeline items
      sectionRef.current!.querySelectorAll('.timeline-item').forEach((item) => {
        // Card slide in
        gsap.to(item, {
          opacity: 1,
          x: 0,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: item,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        });

        // Dot scale in with spring
        const dot = item.querySelector('.timeline-dot');
        if (dot) {
          gsap.to(dot, {
            scale: 1,
            duration: 0.5,
            ease: 'back.out(3)',
            scrollTrigger: {
              trigger: item,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          });
        }

        // Narrative text reveal
        const narrative = item.querySelector('.timeline-narrative');
        if (narrative) {
          gsap.to(narrative, {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: item,
              start: 'top 65%',
              toggleActions: 'play none none reverse',
            },
          });
        }

        // Bullet points stagger in
        const points = item.querySelectorAll('.timeline-points li');
        if (points.length) {
          gsap.to(points, {
            opacity: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.08,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: item,
              start: 'top 60%',
              toggleActions: 'play none none reverse',
            },
          });
        }

        // Tech tags stagger in with scale bounce
        const tags = item.querySelectorAll('.timeline-tags span');
        if (tags.length) {
          gsap.to(tags, {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.4,
            stagger: 0.04,
            ease: 'back.out(2)',
            scrollTrigger: {
              trigger: item,
              start: 'top 50%',
              toggleActions: 'play none none reverse',
            },
          });
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="experience" id="experience" data-section="dark" ref={sectionRef}>
      <div className="section-label">
        <span className="material-icons-round">work_history</span>
        <span className="reveal-heading">Work Experience</span>
      </div>

      <div className="timeline">
        {experiences.map(exp => (
          <div className="timeline-item" key={exp.id}>
            <div className="timeline-dot"></div>
            <div className="timeline-card">
              <div className="timeline-header">
                <div>
                  <h3 className="timeline-company">{exp.company}</h3>
                  <p className="timeline-role">{exp.role}</p>
                  <p className="timeline-meta">{exp.meta}</p>
                </div>
                <span className="timeline-dates">{exp.dates}</span>
              </div>
              <p className="timeline-narrative reveal-text">{exp.narrative}</p>
              <ul className="timeline-points">
                {exp.points.map((point, idx) => (
                  <li key={idx} dangerouslySetInnerHTML={{ __html: point }} />
                ))}
              </ul>
              <div className="timeline-tags">
                {exp.tags.map(tag => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
