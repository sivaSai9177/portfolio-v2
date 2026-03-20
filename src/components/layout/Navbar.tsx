import { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { useThemeStore } from '../../lib/themeStore';

gsap.registerPlugin(ScrollToPlugin);

const navLinks = [
  { href: '#journey', label: 'Journey' },
  { href: '#experience', label: 'Experience' },
  { href: '#skills', label: 'Skills' },
  { href: '#projects', label: 'Projects' },
];

const mobileTabItems = [
  { href: '#journey', label: 'Journey', icon: 'explore' },
  { href: '#experience', label: 'Experience', icon: 'work_history' },
  { href: '#skills', label: 'Skills', icon: 'code' },
  { href: '#projects', label: 'Projects', icon: 'apps' },
  { href: '#contact', label: "Let's Talk", icon: 'mail' },
];

export default function Navbar() {
  const theme = useThemeStore(s => s.theme);
  const toggleWithBubble = useThemeStore(s => s.toggleWithBubble);

  // === Desktop nav refs ===
  const navRef = useRef<HTMLDivElement>(null);
  const navLinksContainerRef = useRef<HTMLDivElement>(null);
  const followerRef = useRef<HTMLDivElement>(null);
  const underlineRef = useRef<HTMLDivElement>(null);

  // === Active section tracking (shared desktop + mobile) ===
  const [activeSection, setActiveSection] = useState('');

  // === Mobile bottom bar refs ===
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [activeTabIndex, setActiveTabIndex] = useState(-1);
  const [bottomBarVisible, setBottomBarVisible] = useState(false);

  // -------------------------------------------------------
  //  SMOOTH SCROLL (shared)
  // -------------------------------------------------------
  const scrollToHash = useCallback((href: string) => {
    const element = document.querySelector(href);
    if (element) {
      gsap.to(window, {
        scrollTo: { y: element, autoKill: false },
        duration: 1,
        ease: 'power3.inOut',
      });
    }
  }, []);

  // -------------------------------------------------------
  //  DESKTOP: Smooth scroll setup for hash links
  // -------------------------------------------------------
  useEffect(() => {
    const smoothScroll = (e: MouseEvent) => {
      const target = e.currentTarget as HTMLAnchorElement;
      const href = target.getAttribute('href');
      if (href?.startsWith('#')) {
        e.preventDefault();
        scrollToHash(href);
      }
    };

    const links = navRef.current?.querySelectorAll('a[href^="#"]');
    links?.forEach(link => {
      link.addEventListener('click', smoothScroll as EventListener);
    });

    return () => {
      links?.forEach(link => {
        link.removeEventListener('click', smoothScroll as EventListener);
      });
    };
  }, [scrollToHash]);

  // -------------------------------------------------------
  //  DESKTOP: Magnetic nav animations (3D follower + underline)
  // -------------------------------------------------------
  useEffect(() => {
    const ctx = gsap.context(() => {
      const follower = followerRef.current;
      const underline = underlineRef.current;
      const navLinksContainer = navLinksContainerRef.current;
      if (!navLinksContainer) return;

      let isOverNav = false;

      document.querySelectorAll('.nav-link:not(.nav-link--cta)').forEach(link => {
        const linkEl = link as HTMLElement;

        linkEl.addEventListener('mouseenter', (e) => {
          isOverNav = true;
          const linkRect = linkEl.getBoundingClientRect();
          const containerRect = navLinksContainer.getBoundingClientRect();
          const linkCenterX = linkRect.left + linkRect.width / 2;
          const fromLeft = (e as MouseEvent).clientX < linkCenterX;

          if (follower) {
            const startX = fromLeft
              ? linkRect.left - containerRect.left - 40
              : linkRect.right - containerRect.left + 12;
            const targetX = linkRect.left - containerRect.left + linkRect.width / 2 - 14;
            const targetY = linkRect.top - containerRect.top + linkRect.height / 2 - 14;

            gsap.killTweensOf(follower);
            gsap.set(follower, { left: startX, top: targetY, opacity: 0 });
            follower.classList.add('visible');
            gsap.to(follower, {
              left: targetX, top: targetY, opacity: 1,
              duration: 0.4, ease: 'power3.out',
            });
          }

          if (underline) {
            const targetLeft = linkRect.left - containerRect.left;
            const targetWidth = linkRect.width;

            gsap.killTweensOf(underline);
            if (!underline.classList.contains('visible')) {
              const startLeft = fromLeft ? targetLeft - 40 : targetLeft + targetWidth + 20;
              gsap.set(underline, { left: startLeft, width: 0, opacity: 0 });
            }
            underline.classList.add('visible');
            gsap.to(underline, {
              left: targetLeft, width: targetWidth, opacity: 1,
              duration: 0.35, ease: 'power3.out',
            });
          }
        });

        linkEl.addEventListener('mousemove', (e) => {
          const linkRect = linkEl.getBoundingClientRect();
          const containerRect = navLinksContainer.getBoundingClientRect();
          const mouseEvent = e as MouseEvent;

          if (follower) {
            gsap.to(follower, {
              left: mouseEvent.clientX - containerRect.left - 14,
              top: linkRect.top - containerRect.top + linkRect.height / 2 - 14,
              duration: 0.2, ease: 'power2.out',
            });
          }

          const x = mouseEvent.clientX - linkRect.left - linkRect.width / 2;
          const y = mouseEvent.clientY - linkRect.top - linkRect.height / 2;
          gsap.to(linkEl, { x: x * 0.3, y: y * 0.3, duration: 0.3, ease: 'power2.out' });
        });

        linkEl.addEventListener('mouseleave', (e) => {
          isOverNav = false;
          const linkRect = linkEl.getBoundingClientRect();
          const containerRect = navLinksContainer.getBoundingClientRect();
          const exitRight = (e as MouseEvent).clientX > linkRect.left + linkRect.width / 2;

          if (follower) {
            const exitX = exitRight
              ? linkRect.right - containerRect.left + 30
              : linkRect.left - containerRect.left - 40;
            gsap.to(follower, {
              left: exitX, opacity: 0, duration: 0.3, ease: 'power2.in',
              onComplete: () => { if (!isOverNav) follower.classList.remove('visible'); },
            });
          }

          if (underline) {
            const exitLeft = exitRight
              ? linkRect.right - containerRect.left + 30
              : linkRect.left - containerRect.left - 40;
            gsap.to(underline, {
              left: exitLeft, width: 0, opacity: 0, duration: 0.3, ease: 'power2.in',
              onComplete: () => { if (!isOverNav) underline.classList.remove('visible'); },
            });
          }

          gsap.to(linkEl, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.4)' });
        });
      });

      // CTA magnetic
      const cta = document.querySelector('.nav-link--cta') as HTMLElement;
      if (cta) {
        cta.addEventListener('mousemove', (e) => {
          const rect = cta.getBoundingClientRect();
          const x = (e as MouseEvent).clientX - rect.left - rect.width / 2;
          const y = (e as MouseEvent).clientY - rect.top - rect.height / 2;
          gsap.to(cta, { x: x * 0.15, y: y * 0.15, duration: 0.3, ease: 'power2.out' });
        });
        cta.addEventListener('mouseleave', () => {
          gsap.to(cta, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.4)' });
        });
      }
    }, navRef);

    return () => ctx.revert();
  }, []);

  // -------------------------------------------------------
  //  DESKTOP: Scroll effect (top nav glass bg + top mask)
  // -------------------------------------------------------
  const topMaskRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 60;
      if (navRef.current) {
        navRef.current.classList.toggle('scrolled', scrolled);
      }
      // Show the top mask only after scrolling past the hero area
      if (topMaskRef.current) {
        topMaskRef.current.classList.toggle('visible', window.scrollY > 200);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // -------------------------------------------------------
  //  SCROLL: Track active section for both desktop + mobile
  // -------------------------------------------------------
  useEffect(() => {
    const mobileSectionIds = mobileTabItems.map(item => item.href.replace('#', ''));
    const desktopSectionIds = navLinks.map(item => item.href.replace('#', ''));

    const handleScroll = () => {
      setBottomBarVisible(window.scrollY > 200);

      const scrollY = window.scrollY + window.innerHeight / 3;

      // Mobile active tab
      for (let i = mobileSectionIds.length - 1; i >= 0; i--) {
        const section = document.getElementById(mobileSectionIds[i]);
        if (section && section.offsetTop <= scrollY) {
          setActiveTabIndex(i);
          break;
        }
        if (i === 0) setActiveTabIndex(-1);
      }

      // Desktop active link
      let found = '';
      for (let i = desktopSectionIds.length - 1; i >= 0; i--) {
        const section = document.getElementById(desktopSectionIds[i]);
        if (section && section.offsetTop <= scrollY) {
          found = desktopSectionIds[i];
          break;
        }
      }
      setActiveSection(found);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // -------------------------------------------------------
  //  Logo click → top
  // -------------------------------------------------------
  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    gsap.to(window, { scrollTo: { y: 0, autoKill: false }, duration: 1, ease: 'power3.inOut' });
  };

  // Theme icon text (reactive from Zustand)
  const themeIconText = theme === 'light' ? 'dark_mode' : 'light_mode';

  return (
    <>
      {/* Gradient mask — covers gap above floating nav, appears on scroll */}
      <div className="nav-top-mask" ref={topMaskRef} aria-hidden="true" />

      {/* ============ DESKTOP TOP NAVBAR ============ */}
      <nav className="nav" id="nav" ref={navRef}>
        <a href="#hero" className="nav-logo" onClick={handleLogoClick}>
          SS
        </a>
        <div className="nav-links" ref={navLinksContainerRef}>
          <div className="nav-3d-follower" id="nav3dFollower" ref={followerRef} aria-hidden="true">
            <div className="nav-3d-shape"></div>
          </div>
          <div className="nav-underline" id="navUnderline" ref={underlineRef} aria-hidden="true"></div>
          {navLinks.map(link => {
            const sectionId = link.href.replace('#', '');
            const isActive = activeSection === sectionId;
            return (
              <a
                key={link.href}
                href={link.href}
                className={`nav-link${isActive ? ' active' : ''}`}
              >
                {link.label}
              </a>
            );
          })}
          <a href="#contact" className="nav-link nav-link--cta">
            Let's Talk
          </a>
        </div>
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
        {/* Hamburger hidden on mobile since we have bottom bar */}
        <button className="nav-hamburger" id="hamburger" aria-label="Menu">
          <span></span><span></span><span></span>
        </button>
      </nav>

      {/* ============ MOBILE BOTTOM TAB BAR ============ */}
      <div
        className={`bottom-bar ${bottomBarVisible ? 'visible' : ''}`}
        role="navigation"
        aria-label="Mobile navigation"
      >
        {mobileTabItems.map((item, idx) => (
          <button
            key={item.href}
            ref={el => { tabRefs.current[idx] = el; }}
            className={`bottom-bar-tab ${activeTabIndex === idx ? 'active' : ''}`}
            onClick={() => { scrollToHash(item.href); setActiveTabIndex(idx); }}
            aria-label={item.label}
          >
            <span className="material-icons-round bottom-bar-icon">{item.icon}</span>
            <span className="bottom-bar-label">{item.label}</span>
          </button>
        ))}

        {/* Theme toggle in bottom bar */}
        <button
          className="bottom-bar-tab bottom-bar-theme"
          id="mobileThemeToggle"
          aria-label="Toggle theme"
          onClick={(e) => toggleWithBubble(e.currentTarget)}
        >
          <span className="material-icons-round bottom-bar-icon" id="mobileThemeIcon">
            {themeIconText}
          </span>
          <span className="bottom-bar-label">Theme</span>
        </button>
      </div>
    </>
  );
}
