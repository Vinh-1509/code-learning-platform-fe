import { useState } from 'react';
import { AppSidebar } from '../../components/sidebar/sideBar';
import { CurrentLessonBanner } from './currentLessonBanner';
import { StatsGrid } from './statsGrid';
import { LearningRoadmap } from './learningRoadmap';
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
      <Navbar />

      {/* SIDEBAR */}

      <AppSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        completedLessons={loading ? undefined : completedLessons}
        totalLessons={loading ? undefined : totalLessons}
      />

      {/* CONTENT */}
      <main className="ml-64 pt-14 h-screen overflow-y-auto">
        <div className="p-8 max-w-7xl mx-auto space-y-6">
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
