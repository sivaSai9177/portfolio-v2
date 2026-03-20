import React, { lazy } from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createRouter, createRootRoute, createRoute } from '@tanstack/react-router';
import App from './App';
import HomePage from './pages/Home';
import './styles/style.css';

// Lazy-load showcase page for code splitting
const ShowcasePage = lazy(() => import('./pages/Showcase'));

const rootRoute = createRootRoute({
  component: App,
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
});

const showcaseRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/showcase',
  component: ShowcasePage,
});

const routeTree = rootRoute.addChildren([homeRoute, showcaseRoute]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
