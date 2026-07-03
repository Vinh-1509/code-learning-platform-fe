import { createRootRoute, Outlet } from '@tanstack/react-router';
// import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { AuthProvider } from '@/features/auth/hooks/AuthContextProvider';
import { TourProvider } from '@/components/tour/TourProvider';

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
      <TourProvider>
        <Outlet />
      </TourProvider>
    </AuthProvider>
    {/* <TanStackRouterDevtools /> */}
  </>
);

export const Route = createRootRoute({ component: RootLayout });
