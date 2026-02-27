import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { splitText } from '../../lib/splitText';

gsap.registerPlugin(ScrollTrigger);

export default function Hero() {
  const heroRef = useRef<HTMLDivElement>(null);
  const greetingRef = useRef<HTMLParagraphElement>(null);
  const nameLineRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const titleRef = useRef<HTMLParagraphElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLAnchorElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Split name into characters
      const nameLines = document.querySelectorAll('.hero-name-line');
      nameLines.forEach(line => {
        splitText(line as HTMLElement, 'char');
      });

      // Create timeline
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      // Greeting
      tl.to('.hero-greeting', {
        opacity: 1,
        y: 0,
        duration: 0.8,
        delay: 0.3,
      });

      // Name characters — stagger from bottom with 3D rotation
      tl.to(
        '.hero-name-line .char',
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          duration: 0.7,
          stagger: 0.035,
          ease: 'power4.out',
        },
        '-=0.3'
      );

      // Title
      tl.to(
        '.hero-title',
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
        },
        '-=0.2'
      );

      // Tagline
      tl.to(
        '.hero-tagline',
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
        },
        '-=0.3'
      );

      // CTA button
      tl.to(
        '.hero-cta',
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
        },
        '-=0.2'
      );

      // Scroll indicator
      tl.to(
        '.scroll-indicator',
        {
          opacity: 1,
          duration: 0.6,
        },
        '-=0.1'
      );

      // Parallax scroll out — hero content moves up + fades
      gsap.to('.hero-content', {
        y: -100,
        opacity: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero',
          start: 'top top',
          end: 'bottom top',
          scrub: 1.5,
        },
      });

      // Scroll indicator fades out on scroll
      gsap.fromTo(
        '.scroll-indicator',
        { opacity: 1 },
        {
          opacity: 0,
          immediateRender: false,
          ease: 'none',
          scrollTrigger: {
            trigger: '.hero',
            start: '10% top',
            end: '30% top',
            scrub: 1,
          },
        }
      );

      // Button flip enhancement
      const buttons = document.querySelectorAll('.hero-cta');
      buttons.forEach(btn => {
        btn.addEventListener('mouseenter', () => {
          gsap.to(btn, {
            '--flip-rotation': '180deg',
            duration: 0.6,
            ease: 'elastic.out(1, 0.5)',
          } as any);
        });

        btn.addEventListener('mouseleave', () => {
          gsap.to(btn, {
            '--flip-rotation': '0deg',
            duration: 0.6,
            ease: 'elastic.out(1, 0.5)',
          } as any);
        });
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="hero" id="hero" data-section="dark" ref={heroRef}>
      <div className="hero-grain"></div>

      {/* Geometric decorations */}
      <div className="deco deco-ring" style={{ '--size': '120px' } as any} aria-hidden="true"></div>
      <div className="deco deco-dot" style={{ top: '25%', right: '12%' }} aria-hidden="true"></div>
      <div className="deco deco-line" style={{ top: '70%', left: '5%', '--rotation': '25deg' } as any} aria-hidden="true"></div>
      <div className="deco deco-dot" style={{ top: '80%', right: '20%' }} aria-hidden="true"></div>

      <div className="hero-content">
        <p className="hero-greeting" ref={greetingRef} id="heroGreeting">
          Hello, I'm
        </p>
        <h1 className="hero-name" id="heroName">
          <span className="hero-name-line" ref={el => { nameLineRefs.current[0] = el; }}>
            Sirigiri
          </span>
          <span className="hero-name-line" ref={el => { nameLineRefs.current[1] = el; }}>
            Siva Sai
          </span>
        </h1>
        <p className="hero-title" ref={titleRef} id="heroTitle">
          Frontend Developer
        </p>
        <p className="hero-tagline" ref={taglineRef} id="heroTagline">
          I build the systems my teammates build on.
        </p>
        <a href="#contact" className="hero-cta" ref={ctaRef}>
          Let's Talk <span className="material-icons-round">arrow_forward</span>
        </a>
      </div>
      <div className="scroll-indicator" id="scrollIndicator" ref={scrollIndicatorRef}>
        <span className="scroll-text">Scroll to explore</span>
        <div className="scroll-line"></div>
      </div>
    </section>
  );
}
