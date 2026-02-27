import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import * as THREE from 'three';

gsap.registerPlugin(ScrollTrigger);

// Extend window interface for theme-related globals
declare global {
  interface Window {
    threeShapeMaterials?: THREE.Material[];
    threeShapeGroups?: {
      bright: THREE.Mesh[];
      normal: THREE.Mesh[];
      dim: THREE.Mesh[];
    };
    threeCursorShape?: THREE.Mesh;
    threeTrail?: Array<{ mesh: THREE.Mesh; pos: { x: number; y: number } }>;
    threeGlobeMaterials?: {
      dots: THREE.ShaderMaterial;
      shield: THREE.ShaderMaterial;
      sunlight: THREE.ShaderMaterial;
      rings: THREE.MeshBasicMaterial[];
      stars: THREE.ShaderMaterial;
    };
    threeForceRender?: () => void;
    updateThreeMaterials?: (theme: string) => void;
  }
}

// Dark theme colors for Three.js
const darkThreeColors = {
  shape: 0xf5a623,
  globe: 0xf5a623,
  shield: 0xf5a623,
  dimDot: 0x8a7d6a,
  bright: 0.2,
  normal: 0.12,
  dim: 0.06,
  cursor: 0.35,
  trail: 0.15,
};

// Light theme colors for Three.js
const lightThreeColors = {
  shape: 0xb8860b,
  globe: 0xb87348,
  shield: 0xc8943c,
  dimDot: 0x9a8872,
  bright: 0.35,
  normal: 0.22,
  dim: 0.12,
  cursor: 0.5,
  trail: 0.25,
};

export function initThemeToggle() {
  const toggle = document.getElementById('themeToggle');
  const mobileToggle = document.getElementById('mobileThemeToggle');
  const icon = document.getElementById('themeIcon');
  const mobileIcon = document.getElementById('mobileThemeIcon');
  const bubble = document.getElementById('themeBubble');
  const root = document.documentElement;
  if (!toggle || !bubble) return;

  // Sync both icons helper
  function syncIcons(theme: string) {
    const text = theme === 'light' ? 'dark_mode' : 'light_mode';
    if (icon) icon.textContent = text;
    if (mobileIcon) mobileIcon.textContent = text;
  }

  // Apply saved theme on load
  const saved = localStorage.getItem('theme');
  if (saved === 'light') {
    root.setAttribute('data-theme', 'light');
    syncIcons('light');
    updateThreeMaterials('light');
  }

  let animating = false;
  let themeRafOuter: number | null = null;
  let themeRafInner: number | null = null;

  function applyTheme(next: string, skipClassRemoval?: boolean) {
    // Cancel stale RAF callbacks from previous toggle
    if (themeRafOuter) cancelAnimationFrame(themeRafOuter);
    if (themeRafInner) cancelAnimationFrame(themeRafInner);

    root.classList.add('theme-switching');
    root.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    syncIcons(next);
    updateThreeMaterials(next);
    if (window.threeForceRender) window.threeForceRender();

    // When using View Transitions, defer class removal until after transition.finished
    if (!skipClassRemoval) {
      themeRafOuter = requestAnimationFrame(() => {
        themeRafInner = requestAnimationFrame(() => {
          root.classList.remove('theme-switching');
          themeRafOuter = null;
          themeRafInner = null;
        });
      });
    }
  }

  function handleToggleClick(originEl: HTMLElement) {
    if (animating) return;
    animating = true;

    const rect = originEl.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    const current = root.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const maxRadius = Math.hypot(Math.max(x, vw - x), Math.max(y, vh - y));
    // Scale duration with viewport diagonal — consistent speed across all devices
    const diagonal = Math.hypot(vw, vh);
    const transitionDuration = Math.min(1000, Math.max(500, Math.round(diagonal * 0.35)));

    // ── Canvas circle cover (reliable cross-browser) ──────────────────────
    const bubbleDuration = transitionDuration / 1000;
    const newBgColor = next === 'dark' ? '#0a0a0a' : '#f5f3ef';

    // 1. Create transparent canvas overlay
    const cvs = document.createElement('canvas');
    cvs.width = window.innerWidth;
    cvs.height = window.innerHeight;
    cvs.style.cssText = 'position:fixed;inset:0;z-index:9999;pointer-events:none;';
    document.body.appendChild(cvs);
    const ctx = cvs.getContext('2d');
    if (!ctx) {
      document.body.removeChild(cvs);
      animating = false;
      return;
    }

    // 2. Start icon rotation on the active toggle's icon
    const activeIcon = originEl.querySelector('.theme-toggle-icon, .bottom-bar-icon');
    if (activeIcon) {
      gsap.fromTo(activeIcon, { rotate: -90 }, { rotate: 0, duration: 0.6, ease: 'back.out(3)' });
    }

    // 3. GSAP drives the circle radius; canvas redraws on every tick
    let themeApplied = false;
    const proxy = { r: 0 };
    gsap.to(proxy, {
      r: maxRadius,
      duration: bubbleDuration,
      ease: 'power2.inOut',
      onUpdate() {
        ctx.clearRect(0, 0, cvs.width, cvs.height);
        ctx.fillStyle = newBgColor;
        ctx.beginPath();
        ctx.arc(x, y, proxy.r, 0, Math.PI * 2);
        ctx.fill();

        if (!themeApplied && proxy.r >= maxRadius * 0.95) {
          themeApplied = true;
          applyTheme(next, true);
        }
      },
      onComplete() {
        if (!themeApplied) applyTheme(next, true);
        document.body.removeChild(cvs);
        root.classList.remove('theme-switching');
        requestAnimationFrame(() => {
          animating = false;
          ScrollTrigger.refresh();
        });
      },
    });
  }

  toggle.addEventListener('click', () => handleToggleClick(toggle));
  if (mobileToggle) {
    mobileToggle.addEventListener('click', () => handleToggleClick(mobileToggle));
  }

  function updateThreeMaterials(theme: string) {
    const colors = theme === 'light' ? lightThreeColors : darkThreeColors;

    // Update wireframe shape materials
    if (window.threeShapeMaterials) {
      window.threeShapeMaterials.forEach((mat) => {
        const basicMat = mat as THREE.MeshBasicMaterial;
        basicMat.color.setHex(colors.shape);
      });
    }

    if (window.threeShapeGroups) {
      window.threeShapeGroups.bright.forEach((m) => {
        (m.userData as any).baseOpacity = colors.bright;
      });
      window.threeShapeGroups.normal.forEach((m) => {
        (m.userData as any).baseOpacity = colors.normal;
      });
      window.threeShapeGroups.dim.forEach((m) => {
        (m.userData as any).baseOpacity = colors.dim;
      });
    }

    if (window.threeCursorShape) {
      const cursorMat = window.threeCursorShape.material as THREE.MeshBasicMaterial;
      cursorMat.color.setHex(colors.shape);
    }

    if (window.threeTrail) {
      window.threeTrail.forEach((t, i) => {
        (t.mesh.userData as any).baseOpacity = colors.trail - i * 0.025;
        const trailMat = t.mesh.material as THREE.MeshBasicMaterial;
        trailMat.color.setHex(colors.shape);
      });
    }

    // Update globe materials
    if (window.threeGlobeMaterials) {
      const gc = colors.globe;
      const isLight = theme === 'light';

      window.threeGlobeMaterials.dots.uniforms.uColor.value.setHex(gc);
      window.threeGlobeMaterials.dots.uniforms.uDimColor.value.setHex(colors.dimDot);

      window.threeGlobeMaterials.shield.uniforms.uColor.value.setHex(colors.shield);
      window.threeGlobeMaterials.shield.blending = isLight ? THREE.NormalBlending : THREE.AdditiveBlending;
      window.threeGlobeMaterials.shield.needsUpdate = true;

      window.threeGlobeMaterials.sunlight.blending = isLight ? THREE.NormalBlending : THREE.AdditiveBlending;
      window.threeGlobeMaterials.sunlight.needsUpdate = true;

      window.threeGlobeMaterials.stars.uniforms.uColor.value.setHex(gc);

      window.threeGlobeMaterials.rings.forEach((mat) => mat.color.setHex(gc));
    }
  }

  // Expose for external calls
  window.updateThreeMaterials = updateThreeMaterials;
}
