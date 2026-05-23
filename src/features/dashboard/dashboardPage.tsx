import { useState } from 'react';
import { Sidebar } from './sideBar';
import { Header } from './header';
import { CurrentLessonBanner } from './currentLessonBanner';
import { StatsGrid } from './statsGrid';
import { LearningRoadmap } from './learningRoadmap';
import { useRoadmap } from './useRoadmap';
import { useStartLesson } from '@/hooks/useStartLesson';

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
    <div className="min-h-screen bg-white">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="ml-64 min-h-screen p-8 bg-[#f8fafc] flex justify-center">
        <div className="max-w-7xl w-full mx-auto space-y-6">
          <Header />
          <div className="space-y-6">
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
        </div>
      </main>
    </div>
  );
}
