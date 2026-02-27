import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { splitText } from '../../lib/splitText';
import HeroThreeScene from './HeroThreeScene';

gsap.registerPlugin(ScrollTrigger);

export default function ShowcaseHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const subRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const metaRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (!containerRef.current) return;

      // Split title into characters
      if (titleRef.current) {
        splitText(titleRef.current, 'char');
      }

      const timeline = gsap.timeline();

      // Label fade in
      if (labelRef.current) {
        timeline.to(
          labelRef.current,
          { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' },
          0
        );
      }

      // Title characters stagger from below with rotateX
      const titleChars = titleRef.current?.querySelectorAll('.char');
      if (titleChars && titleChars.length > 0) {
        timeline.to(
          titleChars,
          { opacity: 1, y: 0, rotateX: 0, duration: 0.6, stagger: 0.02, ease: 'back.out(1.2)' },
          0.1
        );
      }

      // Sub text
      if (subRef.current) {
        timeline.to(subRef.current, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, 0.3);
      }

      // Actions
      if (actionsRef.current) {
        timeline.to(actionsRef.current, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, 0.4);
      }

      // Meta stats
      if (metaRef.current) {
        timeline.to(metaRef.current, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, 0.5);
      }

      // 3D scene entrance
      if (sceneRef.current) {
        timeline.to(
          sceneRef.current,
          { opacity: 1, scale: 1, duration: 1, ease: 'power2.out' },
          0.2
        );

        // Parallax on scroll
        gsap.to(sceneRef.current, {
          y: -50,
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top top',
            end: 'bottom center',
            scrub: 0.5,
          },
        });
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="sc-hero sc-cyber-grid">
      <div>
        <div ref={labelRef} className="sc-hero-label">
          <span className="sc-hero-label-prompt">&gt;</span> case_study --load cybersec_platform
        </div>

        <h1 ref={titleRef} className="sc-hero-title">
          Cybersecurity Management Platform
        </h1>

        <p ref={subRef} className="sc-hero-sub">
          Enterprise-grade security platform built across two companies — from laying the first
          component at Nubewell to modernizing the entire architecture at Sechpoint.
          Architected to scale from 100 to 10,000+ managed devices.
        </p>

        <div ref={actionsRef} className="sc-hero-actions">
          <a href="#" className="sc-btn sc-btn--primary">
            <span className="material-icons-round">visibility</span>
            Live Preview
          </a>
          <a href="#" className="sc-btn sc-btn--ghost">
            <span className="material-icons-round">code</span>
            Source Code
          </a>
        </div>

        <div ref={metaRef} className="sc-hero-meta">
          <div className="sc-meta-item">
            <span className="sc-meta-value">20</span>
            <span className="sc-meta-label">Months</span>
          </div>
          <div className="sc-meta-item">
            <span className="sc-meta-value">90+</span>
            <span className="sc-meta-label">Components</span>
          </div>
          <div className="sc-meta-item">
            <span className="sc-meta-value">60+</span>
            <span className="sc-meta-label">Routes</span>
          </div>
          <div className="sc-meta-item">
            <span className="sc-meta-value">2</span>
            <span className="sc-meta-label">Companies</span>
          </div>
        </div>
      </div>

      <div ref={sceneRef} className="sc-hero-mockup" style={{ opacity: 0, transform: 'scale(0.9)' }}>
        <HeroThreeScene />
      </div>
    </section>
  );
}
