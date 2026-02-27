import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { splitText } from '../../lib/splitText';

gsap.registerPlugin(ScrollTrigger);

interface SkillGroup {
  category: string;
  title: string;
  icon: string;
  isWide?: boolean;
  skills: Array<{
    name: string;
    highlight?: boolean;
    accent?: boolean;
  }>;
}

const skillGroups: SkillGroup[] = [
  {
    category: 'core',
    title: 'Core Languages',
    icon: 'code',
    skills: [
      { name: 'TypeScript', highlight: true },
      { name: 'JavaScript ES6+', highlight: true },
      { name: 'HTML5' },
      { name: 'CSS3 / SCSS' },
    ],
  },
  {
    category: 'frameworks',
    title: 'Frameworks',
    icon: 'widgets',
    skills: [
      { name: 'React 19', highlight: true },
      { name: 'Next.js', highlight: true },
      { name: 'Angular' },
      { name: 'React Native' },
      { name: 'Expo' },
      { name: 'TanStack Start' },
    ],
  },
  {
    category: 'ui',
    title: 'UI Systems',
    icon: 'palette',
    skills: [
      { name: 'Material UI v7', highlight: true },
      { name: 'MUI X Data Grid' },
      { name: 'MUI X Charts' },
      { name: 'GSAP' },
    ],
  },
  {
    category: 'state',
    title: 'State & Data',
    icon: 'hub',
    skills: [
      { name: 'TanStack Query', highlight: true },
      { name: 'Zustand', highlight: true },
      { name: 'TanStack Table' },
      { name: 'Axios' },
      { name: 'Socket.io' },
    ],
  },
  {
    category: 'viz',
    title: 'Visualization',
    icon: 'bar_chart',
    skills: [
      { name: 'Recharts', highlight: true },
      { name: 'D3.js' },
      { name: 'amCharts 5' },
      { name: 'Chart.js' },
    ],
  },
  {
    category: 'tooling',
    title: 'Tooling & DX',
    icon: 'build',
    skills: [
      { name: 'Vite', highlight: true },
      { name: 'Git' },
      { name: 'Vitest' },
      { name: 'Zod' },
      { name: 'ESLint' },
    ],
  },
  {
    category: 'exploring',
    title: 'Exploring & Learning',
    icon: 'rocket_launch',
    isWide: true,
    skills: [
      { name: 'Hono', accent: true },
      { name: 'Bun', accent: true },
      { name: 'Drizzle', accent: true },
      { name: 'Prisma', accent: true },
      { name: 'tRPC', accent: true },
      { name: 'oRPC', accent: true },
      { name: 'Claude Code', accent: true },
      { name: 'Codex', accent: true },
      { name: 'Gemini', accent: true },
    ],
  },
];

export default function Skills() {
  const skillsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Split label heading
      const labels = document.querySelectorAll('.section-label .reveal-heading');
      labels.forEach(label => {
        splitText(label as HTMLElement, 'char');
      });

      gsap.to('.section-label .reveal-heading .char', {
        opacity: 1,
        y: 0,
        rotateX: 0,
        duration: 0.6,
        stagger: 0.02,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.skills',
          start: 'top 70%',
          end: 'top 40%',
          scrub: 1,
        },
      });

      // Skill groups staggered reveal
      document.querySelectorAll('.skill-group').forEach((group, index) => {
        gsap.set(group, { opacity: 0, y: 30, scale: 0.95 });
        gsap.to(group, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          ease: 'back.out(1.2)',
          delay: index * 0.08,
          scrollTrigger: {
            trigger: '.skills-grid',
            start: 'top 60%',
            end: 'top 20%',
            scrub: 1,
          },
        });

        // Pills cascade within each group
        const pills = group.querySelectorAll('.pill');
        gsap.set(pills, { opacity: 0, scale: 0.8 });
        gsap.to(pills, {
          opacity: 1,
          scale: 1,
          duration: 0.5,
          stagger: 0.05,
          ease: 'elastic.out(1, 0.4)',
          scrollTrigger: {
            trigger: group,
            start: 'top 70%',
            end: 'top 40%',
            scrub: 1,
          },
        });

        // Hover glow on pills
        pills.forEach(pill => {
          (pill as HTMLElement).addEventListener('mouseenter', () => {
            gsap.to(pill, {
              textShadow: `0 0 12px var(--accent)`,
              scale: 1.08,
              duration: 0.3,
              ease: 'power2.out',
            });
          });

          (pill as HTMLElement).addEventListener('mouseleave', () => {
            gsap.to(pill, {
              textShadow: `0 0 0px var(--accent)`,
              scale: 1,
              duration: 0.3,
              ease: 'power2.out',
            });
          });
        });
      });
    }, skillsRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="skills" id="skills" data-section="dark" ref={skillsRef}>
      <div className="section-label">
        <span className="material-icons-round">terminal</span>
        <span className="reveal-heading">Tech Ecosystem</span>
      </div>

      {/* Geometric decorations */}
      <div className="deco deco-ring" style={{ '--size': '100px' } as any} aria-hidden="true"></div>
      <div className="deco deco-dot" style={{ top: '50%', left: '3%' }} aria-hidden="true"></div>

      <div className="skills-grid">
        {skillGroups.map(group => (
          <div
            key={group.category}
            className={`skill-group ${group.isWide ? 'skill-group--wide' : ''}`}
            data-category={group.category}
          >
            <h4 className="skill-group-title">
              <span className="material-icons-round">{group.icon}</span> {group.title}
            </h4>
            <div className="skill-pills">
              {group.skills.map(skill => (
                <span
                  key={skill.name}
                  className={`pill ${skill.highlight ? 'pill--hl' : ''} ${skill.accent ? 'pill--accent' : ''}`}
                >
                  {skill.name}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
