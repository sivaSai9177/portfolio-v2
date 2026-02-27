import { useEffect, useRef } from 'react';
import { Link } from '@tanstack/react-router';
import { useThemeStore } from '../../lib/themeStore';

export default function ShowcaseNavbar() {
  const navRef = useRef<HTMLElement>(null);
  const topMaskRef = useRef<HTMLDivElement>(null);
  const theme = useThemeStore(s => s.theme);
  const toggleWithBubble = useThemeStore(s => s.toggleWithBubble);

  useEffect(() => {
    const handleScroll = () => {
      if (navRef.current) {
        navRef.current.classList.toggle('scrolled', window.scrollY > 60);
      }
      if (topMaskRef.current) {
        topMaskRef.current.classList.toggle('visible', window.scrollY > 200);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const themeIconText = theme === 'light' ? 'dark_mode' : 'light_mode';

  return (
    <>
    <div className="nav-top-mask" ref={topMaskRef} aria-hidden="true" />
    <nav className="nav" id="nav" ref={navRef}>
      <Link to="/" className="nav-back">
        <span className="material-icons-round">arrow_back</span>
        <span>Portfolio</span>
      </Link>
      <span className="nav-project-name">Case Study</span>
      <button
        className="theme-toggle"
        id="themeToggle"
        aria-label="Toggle theme"
        onClick={(e) => toggleWithBubble(e.currentTarget)}
      >
        <span className="material-icons-round theme-toggle-icon" id="themeIcon">
          {themeIconText}
        </span>
      </button>
      <Link to="/" hash="contact" className="nav-link nav-link--cta">Let's Talk</Link>
    </nav>
    </>
  );
}
