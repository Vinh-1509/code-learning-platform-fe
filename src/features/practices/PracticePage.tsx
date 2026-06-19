import { useState } from 'react';
import { AppSidebar } from '../../components/sidebar/Sidebar';
import Navbar from '@/components/navbar/Navbar';
import { PracticeLibrary } from './PracticeLibrary';
import { useDashboardData } from '@/features/dashboard/useDashboard';

export function PracticePage() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'practice'>(
    'practice'
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { dashboardData, loading } = useDashboardData();

  const completedLessons = loading
    ? undefined
    : (dashboardData?.stats.totalCompletedExercises ?? 0);
  const totalLessons = loading
    ? undefined
    : (dashboardData?.stats.totalExercises ?? 0);

  return (
    <div className="h-screen overflow-hidden bg-background">
      <Navbar
        variant="dashboard"
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      <AppSidebar
        activeTab={activeTab}
        onTabChange={(tab: 'dashboard' | 'practice') => {
          setActiveTab(tab);
          setIsSidebarOpen(false);
        }}
        completedLessons={completedLessons}
        totalLessons={totalLessons}
        progressLabel="Exercises Solved"
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <main className="ml-0 md:ml-64 h-screen overflow-y-auto pt-14">
        <PracticeLibrary />
      </main>
    </div>
  );
}
