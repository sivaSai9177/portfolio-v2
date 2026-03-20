import { Suspense, useEffect } from 'react';
import { Outlet, useRouterState } from '@tanstack/react-router';
import ThreeBackground from './components/layout/ThreeBackground';
import { useThemeStore } from './lib/themeStore';

export default function App() {
  const setTheme = useThemeStore(s => s.setTheme);
  const theme = useThemeStore(s => s.theme);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  // Apply stored theme on first mount (hydrates DOM + Three.js materials)
  useEffect(() => {
    setTheme(theme);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <>
      {/* Three.js 3D Background */}
      <ThreeBackground />

      {/* Floating gradient orbs */}
      <div className="bg-orbs" aria-hidden="true">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
      </div>

      {/* Route content */}
      <Suspense fallback={null}>
        <Outlet />
      </Suspense>
    </>
  );
}
