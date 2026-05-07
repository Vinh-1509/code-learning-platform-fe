import { createFileRoute, redirect } from '@tanstack/react-router';

// Fake auth check
const checkAuth = () => {
  const isLoggedIn = true;

  if (!isLoggedIn) {
    return redirect({
      to: '/login',
    });
  }
};

// Fake data fetch
const fetchDashboardData = async () => {
  await new Promise((resolve) => setTimeout(resolve, 2000));

  return {
    username: 'Vinh',
    score: 95,
  };
};

// Loading UI
function LoadingScreen() {
  return <div className="p-2">Loading dashboard...</div>;
}

// Error UI
function ErrorPage({ error }: { error: Error }) {
  return <div className="p-2 text-red-500">Error: {error.message}</div>;
}

// Main page
function DashboardPage() {
  const data = Route.useLoaderData();

  return (
    <div className="p-2">
      <h1 className="text-xl font-bold">Dashboard</h1>

      <p>Username: {data.username}</p>

      <p>Score: {data.score}</p>
    </div>
  );
}

// Route definition
export const Route = createFileRoute('/dashboard')({
  beforeLoad: checkAuth,

  loader: fetchDashboardData,

  pendingComponent: LoadingScreen,

  errorComponent: ErrorPage,

  component: DashboardPage,
});
