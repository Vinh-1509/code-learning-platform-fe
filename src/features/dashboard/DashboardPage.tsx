import { useState } from 'react';
import { AppSidebar } from '@/components/sidebar/Sidebar';
import { CurrentLessonBanner } from './CurrentLessonBanner';
import { StatsGrid } from './StatsGrid';
import { LearningRoadmap } from './LearningRoadmap';
import { useRoadmap } from './useRoadmap';
import { useStartLesson } from './useStartLesson';
import { useDashboardData } from './useDashboard'; // Imported the new hook
import Navbar from '@/components/navbar/Navbar';

/**
 * DashboardPage is the main entrance component for the authenticated user's workspace dashboard.
 * Coordinates page layout including Navbar, AppSidebar, stats cards, active lesson banners, and LearningRoadmap.
 *
 * @returns {JSX.Element} The rendered DashboardPage view container.
 */
export function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'practice'>(
    'dashboard'
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Roadmap logic from current codebase
  const {
    modules,
    expandedModules,
    toggleModule,
    handleStartLesson,
    currentLesson,
    loading: roadmapLoading,
  } = useRoadmap();

  // Real dashboard statistics fetched here
  const { dashboardData, loading: statsLoading } = useDashboardData();
  const startLesson = useStartLesson();

  const currentLessonBanner = currentLesson ? (
    <CurrentLessonBanner
      lessonId={currentLesson.lessonId}
      lessonName={currentLesson.lessonName}
      moduleName={currentLesson.moduleName}
      progress={currentLesson.progress}
      onStartLesson={startLesson}
    />
  ) : null;

  // Fallback info from the new API structure or fallback to old totals
  const totalLessons = dashboardData?.stats.totalLessons ?? 0;
  const completedLessons = dashboardData?.stats.totalLearnedLessons ?? 0;

  // Unified loading state for critical components
  const isPageLoading = roadmapLoading || statsLoading;

  return (
    <div className="h-screen overflow-hidden">
      {/* HEADER */}
      <Navbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      {/* SIDEBAR */}
      <AppSidebar
        activeTab={activeTab}
        onTabChange={(tab: 'dashboard' | 'practice') => {
          setActiveTab(tab);
          setIsSidebarOpen(false);
        }}
        completedLessons={isPageLoading ? undefined : completedLessons}
        totalLessons={isPageLoading ? undefined : totalLessons}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* CONTENT */}
      <main className="ml-0 md:ml-64 pt-14 h-screen overflow-y-auto">
        <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6 min-h-[calc(100vh-3.5rem)] flex flex-col">
          {!isPageLoading && currentLessonBanner}

          {/* Connected real dynamic statistics from dashboardData payload */}
          <StatsGrid
            lessonsLearned={
              statsLoading ? 0 : (dashboardData?.stats.totalLearnedLessons ?? 0)
            }
            problemsSolved={
              statsLoading
                ? 0
                : (dashboardData?.stats.totalCompletedExercises ?? 0)
            }
          />

          <LearningRoadmap
            modules={modules}
            expandedModules={expandedModules}
            toggleModule={toggleModule}
            handleStartLesson={handleStartLesson}
            loading={roadmapLoading}
            className="flex-1"
          />
        </div>
      </main>
    </div>
  );
}
