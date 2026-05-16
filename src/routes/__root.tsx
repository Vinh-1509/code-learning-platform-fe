import { createRootRoute, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { AuthProvider } from '@/features/auth/AuthContextProvider';

const RootLayout = () => (
  <>
    {/* <div className="p-2 flex gap-2">
      <Link to="/dashboard" className="[&.active]:font-bold">
        Dashboard
      </Link>{' '}
      <Link to="/practice" className="[&.active]:font-bold">
        Practice
      </Link>
    </div>
    <hr /> */}
    <AuthProvider>
      <Outlet />
    </AuthProvider>
    <TanStackRouterDevtools />
  </>
);

export const Route = createRootRoute({ component: RootLayout });
