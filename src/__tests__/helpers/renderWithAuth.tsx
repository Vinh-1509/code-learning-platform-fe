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

import { AuthProvider } from '@/features/auth/AuthContextProvider';

// Wraps a component with TanStack Router + AuthProvider for auth flow tests
export async function renderWithAuth(
  ui: React.ReactElement,
  initialEntries = ['/']
) {
  const rootRoute = createRootRoute({
    component: () => (
      <AuthProvider>
        <Outlet />
      </AuthProvider>
    ),
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

  const languageSelectionRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/language-selection',
    component: () => <div>Language selection</div>,
  });

  const routeTree = rootRoute.addChildren([
    indexRoute,
    loginRoute,
    signupRoute,
    languageSelectionRoute,
  ]);

  const memoryHistory = createMemoryHistory({ initialEntries });

  const router = createRouter({
    routeTree,
    history: memoryHistory,
  });

  await router.load();

  return {
    ...render(<RouterProvider router={router} />),
    router,
  };
}
