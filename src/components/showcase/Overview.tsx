import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { splitText } from '../../lib/splitText';

gsap.registerPlugin(ScrollTrigger);

export default function Overview() {
  const containerRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const narrativeRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const problemCardsRef = useRef<HTMLDivElement>(null);
  const solutionCardsRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (!containerRef.current) return;

      if (labelRef.current) splitText(labelRef.current, 'char');

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top center+=100',
          toggleActions: 'play none none reverse',
        },
      });

      const labelChars = labelRef.current?.querySelectorAll('.char');
      if (labelChars?.length) {
        tl.to(labelChars, { opacity: 1, duration: 0.4, stagger: 0.02, ease: 'power2.out' }, 0);
      }

      if (narrativeRef.current) {
        tl.to(narrativeRef.current, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }, 0.2);
      }

      if (terminalRef.current) {
        tl.to(terminalRef.current, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }, 0.3);
      }

      if (problemCardsRef.current) {
        const cards = problemCardsRef.current.querySelectorAll('.sc-challenge-card');
        tl.to(cards, { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out' }, 0.5);
      }

      if (arrowRef.current) {
        tl.to(arrowRef.current, { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(1.5)' }, 0.8);
      }

      if (solutionCardsRef.current) {
        const cards = solutionCardsRef.current.querySelectorAll('.sc-challenge-card');
        tl.to(cards, { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out' }, 0.9);
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="sc-overview">
      <div className="sc-section-inner">
        <div ref={labelRef} className="sc-section-label">
          <span className="material-icons-round">shield</span>
          The Challenge
        </div>

        <div ref={narrativeRef} className="sc-challenge-narrative" style={{ opacity: 0, transform: 'translateY(20px)' }}>
          <p>
            When I joined, the platform was functional — but the frontend was held together by
            imperative patterns. useEffect-driven API calls caused race conditions, props were
            drilled through 5+ levels, state was scattered across sessionStorage, and the
            monolithic bundle took seconds to load. I was tasked with modernizing the entire
            frontend architecture while continuing to ship features.
          </p>
        </div>

        <div ref={terminalRef} className="sc-terminal" style={{ opacity: 0, transform: 'translateY(20px)' }}>
          <div className="sc-terminal-header">
            <span className="sc-terminal-dot sc-terminal-dot--red"></span>
            <span className="sc-terminal-dot sc-terminal-dot--yellow"></span>
            <span className="sc-terminal-dot sc-terminal-dot--green"></span>
            <span className="sc-terminal-title">before_migration.tsx</span>
          </div>
          <div className="sc-terminal-body">
            <code>
              <span className="comment">{'// The old pattern — repeated across 90+ components'}</span>{'\n'}
              <span className="keyword">{'const'}</span>{' [data, setData] = '}<span className="function">useState</span>{'([]);\n'}
              <span className="keyword">{'const'}</span>{' [loading, setLoading] = '}<span className="function">useState</span>{'('}<span className="keyword">true</span>{');\n'}
              <span className="keyword">{'const'}</span>{' [error, setError] = '}<span className="function">useState</span>{'('}<span className="keyword">null</span>{');\n\n'}
              <span className="function">useEffect</span>{'(() => {\n'}
              {'  '}<span className="function">fetchDevices</span>{'()          '}<span className="comment">{'// no caching'}</span>{'\n'}
              {'    .'}<span className="function">then</span>{'(res => {          '}<span className="comment">{'// no error boundary'}</span>{'\n'}
              {'      '}<span className="function">setData</span>{'(res.data);     '}<span className="comment">{'// race condition risk'}</span>{'\n'}
              {'      '}<span className="function">setLoading</span>{'('}<span className="keyword">false</span>{');    '}<span className="comment">{'// stale closure'}</span>{'\n'}
              {'    })\n'}
              {'    .'}<span className="keyword">catch</span>{'(err => '}<span className="function">setError</span>{'(err));\n'}
              {'}, [deviceId]);          '}<span className="warn">{'// missing deps warning'}</span>
            </code>
          </div>
        </div>

        <div className="sc-challenge-flow">
          <div ref={problemCardsRef} className="sc-challenge-cards">
            <h3 className="sc-challenge-group-title">
              <span className="material-icons-round" style={{ color: '#f85149' }}>error</span>
              What Was Broken
            </h3>
            {[
              { icon: 'sync_problem', title: 'Race Conditions', desc: 'Unmanaged async calls with no cancellation, causing stale data renders' },
              { icon: 'device_hub', title: 'State Chaos', desc: 'Props drilled 5+ levels, sessionStorage as "state management"' },
              { icon: 'inventory_2', title: 'Monolithic Bundle', desc: 'Zero code splitting across 60+ routes — seconds to first paint' },
              { icon: 'content_copy', title: 'No Shared Library', desc: 'Every developer rebuilding the same patterns from scratch' },
            ].map((item, i) => (
              <div key={i} className="sc-challenge-card sc-challenge-card--problem" style={{ opacity: 0, transform: 'translateY(20px)' }}>
                <span className="material-icons-round">{item.icon}</span>
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div ref={arrowRef} className="sc-challenge-arrow" style={{ opacity: 0, transform: 'scale(0.5)' }}>
            <span className="material-icons-round">arrow_downward</span>
          </div>

          <div ref={solutionCardsRef} className="sc-challenge-cards">
            <h3 className="sc-challenge-group-title">
              <span className="material-icons-round" style={{ color: 'var(--accent)' }}>verified</span>
              What I Built
            </h3>
            {[
              { icon: 'cached', title: 'TanStack Query', desc: 'Server-state caching, background refetch, optimistic updates across all components' },
              { icon: 'hub', title: 'Zustand Stores', desc: 'Typed, predictable state replacing prop drilling and sessionStorage' },
              { icon: 'dynamic_feed', title: 'Route-level Splitting', desc: 'React.lazy + Suspense across 60+ routes — instant navigation' },
              { icon: 'widgets', title: 'Component Library', desc: '90+ shared components — the foundation the entire team ships on' },
            ].map((item, i) => (
              <div key={i} className="sc-challenge-card sc-challenge-card--solution" style={{ opacity: 0, transform: 'translateY(20px)' }}>
                <span className="material-icons-round">{item.icon}</span>
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
