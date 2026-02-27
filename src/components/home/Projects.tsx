import { useEffect, useRef } from 'react';
import { Link } from '@tanstack/react-router';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { splitText } from '../../lib/splitText';

gsap.registerPlugin(ScrollTrigger);

interface ProjectCard {
  id: string;
  number: string;
  label: string;
  title: string;
  description: string;
  tags: string[];
  featured?: boolean;
  images?: string[];
  caseStudyLink?: string;
  isPlaceholder?: boolean;
  placeholderIcon?: string;
}

const projects: ProjectCard[] = [
  {
    id: 'cybersecurity-platform',
    number: '01',
    label: 'Featured · Production',
    title: 'Cybersecurity Management Platform',
    description:
      'Enterprise-grade network security dashboard with real-time analytics, device management, firewall configuration, subscriber analysis, and threat intelligence. Built the entire frontend architecture, component library, and charting system.',
    tags: ['React 19', 'TypeScript', 'MUI v7', 'TanStack Query', 'Zustand', 'Recharts'],
    featured: true,
    images: [
      'assets/work/project-dashboard-1.png',
      'assets/work/project-dashboard-2.png',
      'assets/work/project-devices.png',
      'assets/work/project-url-upload.png',
      'assets/work/project-plan-policy.png',
      'assets/work/project-app-groups.png',
    ],
    caseStudyLink: '/showcase',
  },
  {
    id: 'portfolio-v2',
    number: '02',
    label: 'Coming Soon',
    title: 'Portfolio V2',
    description:
      'This site — built with React, TypeScript, TanStack Router, and GSAP ScrollTrigger. Parallax storytelling, smooth animations, and modern tooling.',
    tags: ['React', 'TypeScript', 'GSAP', 'TanStack Router'],
    isPlaceholder: true,
    placeholderIcon: 'dashboard',
  },
  {
    id: 'stay-tuned',
    number: '03',
    label: 'More projects loading...',
    title: 'Stay Tuned',
    description: 'More projects and screenshots coming soon. Building across React Native, Next.js, and full-stack TypeScript.',
    tags: ['React Native', 'Next.js', 'Expo'],
    isPlaceholder: true,
    placeholderIcon: 'add_circle_outline',
  },
];

export default function Projects() {
  const projectsRef = useRef<HTMLDivElement>(null);

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
          trigger: '.projects',
          start: 'top 70%',
          end: 'top 40%',
          scrub: 1,
        },
      });

      // Cards scale up from center
      document.querySelectorAll('.project-card').forEach((card, index) => {
        gsap.set(card, { opacity: 0, scale: 0.85 });
        gsap.to(card, {
          opacity: 1,
          scale: 1,
          duration: 0.6,
          ease: 'back.out(1.2)',
          delay: index * 0.1,
          scrollTrigger: {
            trigger: '.projects-grid',
            start: 'top 60%',
            end: 'top 20%',
            scrub: 1,
          },
        });

        // Subtle 3D tilt on hover
        (card as HTMLElement).addEventListener('mousemove', (e: MouseEvent) => {
          const rect = (card as HTMLElement).getBoundingClientRect();
          const x = (e.clientX - rect.left) / rect.width - 0.5;   // -0.5 … 0.5
          const y = (e.clientY - rect.top) / rect.height - 0.5;

          gsap.to(card, {
            rotateX: -y * 6,   // max ±3°
            rotateY: x * 6,    // max ±3°
            duration: 0.4,
            ease: 'power2.out',
          });
        });

        (card as HTMLElement).addEventListener('mouseleave', () => {
          gsap.to(card, {
            rotateX: 0,
            rotateY: 0,
            duration: 0.6,
            ease: 'elastic.out(1, 0.5)',
          });
        });
      });
    }, projectsRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="projects" id="projects" data-section="dark" ref={projectsRef}>
      <div className="section-label">
        <span className="material-icons-round">folder_special</span>
        <span className="reveal-heading">Projects</span>
      </div>

      <div className="projects-grid">
        {projects.map(project => (
          <div
            key={project.id}
            className={`project-card ${project.featured ? 'project-card--featured' : ''}`}
            style={{ transformStyle: 'preserve-3d' }}
          >
            <div className="project-card-number">{project.number}</div>

            <div className="project-card-img">
              {project.featured && project.images && (
                <div className="project-card-img--gallery">
                  {project.images.map(src => (
                    <img key={src} src={src} alt="Project screenshot" className="project-screenshot" />
                  ))}
                </div>
              )}
              {project.isPlaceholder && (
                <div className="project-placeholder">
                  <span className="material-icons-round">{project.placeholderIcon}</span>
                </div>
              )}
            </div>

            <div className="project-card-body">
              <span className="project-label">{project.label}</span>
              <h3 className="project-title">{project.title}</h3>
              <p className="project-desc">{project.description}</p>
              <div className="project-tags">
                {project.tags.map(tag => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
              {project.caseStudyLink && (
                <Link to={project.caseStudyLink} className="project-case-study">
                  View Case Study <span className="material-icons-round">arrow_forward</span>
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
