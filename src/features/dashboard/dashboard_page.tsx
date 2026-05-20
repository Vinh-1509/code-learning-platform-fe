import { useState } from 'react';
import { Sidebar } from './components/sidebar';
import { Header } from './components/header';
import { CurrentLessonBanner } from './components/current-lesson-banner';
import { StatsGrid } from './components/stats-grid';
import { LearningRoadmap } from './components/learning-roadmap';

export function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'practice'>(
    'dashboard'
  );

  return (
    <div className="min-h-screen bg-white">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="ml-64 min-h-screen p-8 bg-[#f8fafc] flex justify-center">
        <div className="max-w-7xl w-full mx-auto space-y-6">
          <Header />
          <div className="space-y-6">
            <CurrentLessonBanner
              lessonName="Loop"
              moduleName=""
              progress={65}
            />

            <StatsGrid lessonsLearned={12} problemsSolved={42} />

            <LearningRoadmap />
          </div>
        </div>
      </main>
    </div>
  );
}
