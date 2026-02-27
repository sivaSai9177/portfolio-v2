import { create } from 'zustand';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import * as THREE from 'three';

gsap.registerPlugin(ScrollTrigger);

// ── Types ──────────────────────────────────────────────────
export type Theme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
  animating: boolean;
}

interface ThemeActions {
  /** Apply theme immediately (no animation). Used on initial load. */
  setTheme: (theme: Theme) => void;
  /** Toggle with the canvas-circle bubble animation originating from `originEl`. */
  toggleWithBubble: (originEl: HTMLElement) => void;
}

type ThemeStore = ThemeState & ThemeActions;

// ── Three.js material colour maps ─────────────────────────
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

// ── Helpers (pure side-effects, not stored in Zustand) ────
function applyThemeToDOM(theme: Theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
}

function syncIcons(theme: Theme) {
  const text = theme === 'light' ? 'dark_mode' : 'light_mode';
  document.querySelectorAll('#themeIcon, #mobileThemeIcon').forEach(el => {
    el.textContent = text;
  });
}

function updateThreeMaterials(theme: Theme) {
  const colors = theme === 'light' ? lightThreeColors : darkThreeColors;
  const isLight = theme === 'light';

  // Wireframe shapes
  if (window.threeShapeMaterials) {
    window.threeShapeMaterials.forEach(mat => {
      (mat as THREE.MeshBasicMaterial).color.setHex(colors.shape);
    });
  }

  if (window.threeShapeGroups) {
    window.threeShapeGroups.bright.forEach(m => {
      (m.userData as any).baseOpacity = colors.bright;
    });
    window.threeShapeGroups.normal.forEach(m => {
      (m.userData as any).baseOpacity = colors.normal;
    });
    window.threeShapeGroups.dim.forEach(m => {
      (m.userData as any).baseOpacity = colors.dim;
    });
  }

  if (window.threeCursorShape) {
    (window.threeCursorShape.material as THREE.MeshBasicMaterial).color.setHex(colors.shape);
  }

  if (window.threeTrail) {
    window.threeTrail.forEach((t, i) => {
      (t.mesh.userData as any).baseOpacity = colors.trail - i * 0.025;
      (t.mesh.material as THREE.MeshBasicMaterial).color.setHex(colors.shape);
    });
  }

  // Globe
  if (window.threeGlobeMaterials) {
    const gc = colors.globe;
    window.threeGlobeMaterials.dots.uniforms.uColor.value.setHex(gc);
    window.threeGlobeMaterials.dots.uniforms.uDimColor.value.setHex(colors.dimDot);

    window.threeGlobeMaterials.shield.uniforms.uColor.value.setHex(colors.shield);
    window.threeGlobeMaterials.shield.blending = isLight ? THREE.NormalBlending : THREE.AdditiveBlending;
    window.threeGlobeMaterials.shield.needsUpdate = true;

    window.threeGlobeMaterials.sunlight.blending = isLight ? THREE.NormalBlending : THREE.AdditiveBlending;
    window.threeGlobeMaterials.sunlight.needsUpdate = true;

    window.threeGlobeMaterials.stars.uniforms.uColor.value.setHex(gc);
    window.threeGlobeMaterials.rings.forEach(mat => mat.color.setHex(gc));
  }

  if (window.threeForceRender) window.threeForceRender();
}

// Also expose globally so ThreeBackground.tsx can call it on mount
window.updateThreeMaterials = updateThreeMaterials as (theme: string) => void;

// ── Determine initial theme ───────────────────────────────
function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'dark';
  const stored = localStorage.getItem('theme') as Theme | null;
  return stored ?? 'dark';
}

// ── Zustand store ─────────────────────────────────────────
export const useThemeStore = create<ThemeStore>((set, get) => ({
  theme: getInitialTheme(),
  animating: false,

  setTheme: (theme: Theme) => {
    applyThemeToDOM(theme);
    syncIcons(theme);
    updateThreeMaterials(theme);
    set({ theme });
  },

  toggleWithBubble: (originEl: HTMLElement) => {
    const { animating, theme: current } = get();
    if (animating) return;
    set({ animating: true });

    const next: Theme = current === 'dark' ? 'light' : 'dark';
    const rect = originEl.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const maxRadius = Math.hypot(Math.max(x, vw - x), Math.max(y, vh - y));
    const diagonal = Math.hypot(vw, vh);
    const bubbleDuration = Math.min(1, Math.max(0.5, diagonal * 0.00035));
    const newBgColor = next === 'dark' ? '#0a0a0a' : '#f5f3ef';

    // Canvas overlay
    const cvs = document.createElement('canvas');
    cvs.width = vw;
    cvs.height = vh;
    cvs.style.cssText = 'position:fixed;inset:0;z-index:9999;pointer-events:none;';
    document.body.appendChild(cvs);
    const ctx = cvs.getContext('2d');
    if (!ctx) {
      document.body.removeChild(cvs);
      set({ animating: false });
      return;
    }

    // Icon spin on the clicked toggle
    const activeIcon = originEl.querySelector('.theme-toggle-icon, .bottom-bar-icon');
    if (activeIcon) {
      gsap.fromTo(activeIcon, { rotate: -90 }, { rotate: 0, duration: 0.6, ease: 'back.out(3)' });
    }

    let themeApplied = false;
    const root = document.documentElement;
    root.classList.add('theme-switching');

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
          applyThemeToDOM(next);
          syncIcons(next);
          updateThreeMaterials(next);
          set({ theme: next });
        }
      },
      onComplete() {
        if (!themeApplied) {
          applyThemeToDOM(next);
          syncIcons(next);
          updateThreeMaterials(next);
          set({ theme: next });
        }
        document.body.removeChild(cvs);
        root.classList.remove('theme-switching');
        requestAnimationFrame(() => {
          set({ animating: false });
          ScrollTrigger.refresh();
        });
      },
    });
  },
}));
