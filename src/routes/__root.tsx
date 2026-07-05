import { createRootRoute, Outlet } from '@tanstack/react-router';
// import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { useAuth } from '@/features/auth/useAuth';
import { AuthProvider } from '@/features/auth/hooks/AuthContextProvider';
import { useGacha } from '@/features/gacha/hooks/useGacha';
import { Toaster } from 'sonner';
import { TourProvider } from '@/components/tour/TourProvider';

function AppContent() {
  const { user } = useAuth();

  const myUserId = user?._id || user?._id || '';

  useGacha(myUserId);

  return <Outlet />;
}
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
        <AppContent />
        <Toaster closeButton richColors position="top-right" />
      </TourProvider>
    </AuthProvider>
    {/* <TanStackRouterDevtools /> */}
  </>
);

export const Route = createRootRoute({ component: RootLayout });
