import { useState } from 'react';
import { AppSidebar } from '../../components/sidebar/Sidebar';
import { CurrentLessonBanner } from './CurrentLessonBanner';
import { StatsGrid } from './StatsGrid';
import { LearningRoadmap } from './LearningRoadmap';
import { useRoadmap } from './useRoadmap';
import { useStartLesson } from './useStartLesson';
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
  const {
    modules,
    expandedModules,
    toggleModule,
    handleStartLesson,
    currentLesson,
    loading,
  } = useRoadmap();
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

  //mocked data
  const totalLessons = 45;
  const completedLessons = 12;

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
        completedLessons={loading ? undefined : completedLessons}
        totalLessons={loading ? undefined : totalLessons}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* CONTENT */}
      <main className="ml-0 md:ml-64 pt-14 h-screen overflow-y-auto">
        <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
          {!loading && currentLessonBanner}

          <StatsGrid
            lessonsLearned={loading ? 0 : completedLessons}
            problemsSolved={42}
          />

          <LearningRoadmap
            modules={modules}
            expandedModules={expandedModules}
            toggleModule={toggleModule}
            handleStartLesson={handleStartLesson}
            loading={loading}
          />
        </div>
      </main>
    </div>
  );
}
