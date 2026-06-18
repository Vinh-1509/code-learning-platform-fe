import React from 'react';
import { render } from '@testing-library/react';
import {
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
  createMemoryHistory,
  Outlet,
} from '@tanstack/react-router';

// Wraps a component with TanStack Router so <Link> and router hooks work in tests
export async function renderWithRouter(
  ui: React.ReactElement,
  initialEntries = ['/']
) {
  const rootRoute = createRootRoute({
    component: () => <Outlet />,
  });

  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: () => ui,
  });

  const loginRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/login',
    component: () => <div>Login page</div>,
  });

  const signupRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/signup',
    component: () => <div>Signup page</div>,
  });

  const routeTree = rootRoute.addChildren([
    indexRoute,
    loginRoute,
    signupRoute,
  ]);

  const memoryHistory = createMemoryHistory({ initialEntries });

  const router = createRouter({
    routeTree,
    history: memoryHistory,
  });

  // Router must finish loading before the route component appears in the DOM
  await router.load();

  return {
    ...render(<RouterProvider router={router} />),
    router,
  };
}
