import { useState } from 'react';
import { AppSidebar } from '../../components/sidebar/sideBar';
import { CurrentLessonBanner } from './currentLessonBanner';
import { StatsGrid } from './statsGrid';
import { LearningRoadmap } from './learningRoadmap';
import { useRoadmap } from './useRoadmap';
import { useStartLesson } from './useStartLesson';
import Navbar from '@/components/sidebar/Navbar';

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

  return (
    <div className="h-screen overflow-hidden">
      {/* HEADER */}
      <Navbar />

      {/* SIDEBAR */}

      <AppSidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* CONTENT */}
      <main className="ml-64 pt-14 h-screen overflow-y-auto">
        <div className="p-8 max-w-7xl mx-auto space-y-6">
          {!loading && currentLessonBanner}

          <StatsGrid lessonsLearned={12} problemsSolved={42} />

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
