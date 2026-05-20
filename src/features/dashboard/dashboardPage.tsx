import { useState } from 'react';
// ✅ Đã sửa đường dẫn import khớp 100% với tên file viết hoa chữ cái giữa của bạn
import { Sidebar } from './sideBar';
import { Header } from './header';
import { CurrentLessonBanner } from './currentLessonBanner';
import { StatsGrid } from './statsGrid';
import { LearningRoadmap } from './learningRoadmap';

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
              moduleName="Module 1: Variables & Types"
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
