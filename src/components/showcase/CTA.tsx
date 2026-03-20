import { useEffect, useRef } from 'react';
import { Link } from '@tanstack/react-router';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { splitText } from '../../lib/splitText';

gsap.registerPlugin(ScrollTrigger);

export default function CTA() {
  const containerRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const subRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (!containerRef.current) return;

      // Split heading into characters
      if (headingRef.current) {
        splitText(headingRef.current, 'char');
      }

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top center+=100',
          toggleActions: 'play none none reverse',
        },
      });

      // Heading character reveal
      const headingChars = headingRef.current?.querySelectorAll('.char');
      if (headingChars && headingChars.length > 0) {
        timeline.to(
          headingChars,
          {
            opacity: 1,
            duration: 0.5,
            stagger: 0.03,
            ease: 'power2.out',
          },
          0
        );
      }

      // Sub text fade
      if (subRef.current) {
        timeline.to(
          subRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: 'power2.out',
          },
          0.2
        );
      }

      // Action buttons stagger
      if (actionsRef.current) {
        const buttons = actionsRef.current.querySelectorAll('.sc-btn');
        timeline.to(
          buttons,
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.1,
            ease: 'power2.out',
          },
          0.4
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="sc-cta">
      <div className="sc-cta-inner">
        <h2 ref={headingRef} className="sc-cta-heading">
          Interested in working together?
        </h2>

        <p ref={subRef} className="sc-cta-sub" style={{ opacity: 0, transform: 'translateY(20px)' }}>
          I'm open to frontend roles, freelance projects, and collaborations.
        </p>

        <div
          ref={actionsRef}
          className="sc-cta-actions"
          style={{ opacity: 0, transform: 'translateY(20px)' }}
        >
          <a href="/#contact" className="sc-btn sc-btn--primary">
            <span className="material-icons-round">email</span>
            Get in Touch
          </a>
          <Link to="/" className="sc-btn sc-btn--ghost">
            <span className="material-icons-round">arrow_back</span>
            Back to Portfolio
          </Link>
        </div>
      </div>
    </section>
  );
}
