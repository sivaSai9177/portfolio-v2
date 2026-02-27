import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { splitText } from '../../lib/splitText';

gsap.registerPlugin(ScrollTrigger);

interface JourneyBlock {
  number: string;
  heading: string;
  text: string;
}

const journeyBlocks: JourneyBlock[] = [
  {
    number: '01',
    heading: 'It started with curiosity.',
    text: 'I began with the fundamentals — vanilla HTML, CSS, and JavaScript. Building calculators, budget trackers, and gallery apps. Every pixel taught me how the browser thinks.',
  },
  {
    number: '02',
    heading: 'Then came the ecosystem.',
    text: 'React changed everything. TypeScript made it reliable. I dove into component architecture, state management, and the art of building interfaces that scale — not just pages that render.',
  },
  {
    number: '03',
    heading: 'Now I build platforms.',
    text: 'Production cybersecurity management UIs. 90+ components migrated to modern patterns. 60+ lazy-loaded routes. Reusable chart systems, animated data grids, and the architecture my team ships features on.',
  },
];

export default function Journey() {
  const journeyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      document.querySelectorAll('.journey-block').forEach(block => {
        const heading = block.querySelector('.journey-heading') as HTMLElement;
        const text = block.querySelector('.journey-text');
        const number = block.querySelector('.journey-number');

        // Split heading into characters
        if (heading) {
          const chars = splitText(heading, 'char');

          gsap.to(chars, {
            opacity: 1,
            y: 0,
            rotateX: 0,
            duration: 0.6,
            stagger: 0.02,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: block,
              start: 'top 60%',
              end: 'top 30%',
              scrub: 1,
            },
          });
        }

        // Text fade up
        if (text) {
          gsap.to(text, {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: block,
              start: 'top 65%',
              end: 'top 35%',
              scrub: 1,
            },
          });
        }

        // Number parallax
        if (number) {
          gsap.to(number, {
            y: 30,
            opacity: 0.5,
            ease: 'none',
            scrollTrigger: {
              trigger: block,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1.5,
            },
          });
        }
      });
    }, journeyRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="journey" id="journey" data-section="dark" ref={journeyRef}>
      {/* Geometric decorations */}
      <div className="deco deco-ring" style={{ '--size': '90px' } as any} aria-hidden="true"></div>
      <div className="deco deco-dot" style={{ top: '30%', left: '5%' }} aria-hidden="true"></div>
      <div className="deco deco-line" style={{ top: '60%', right: '8%', '--rotation': '-15deg' } as any} aria-hidden="true"></div>
      <div className="deco deco-dot" style={{ top: '85%', left: '12%' }} aria-hidden="true"></div>

      {journeyBlocks.map(block => (
        <div className="journey-block" key={block.number}>
          <div className="journey-number">{block.number}</div>
          <h2 className="journey-heading reveal-heading">{block.heading}</h2>
          <p className="journey-text reveal-text">{block.text}</p>
        </div>
      ))}
    </section>
  );
}
