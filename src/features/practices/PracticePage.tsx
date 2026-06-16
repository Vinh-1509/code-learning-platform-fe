import { useState } from 'react';

import { AppSidebar } from '../../components/sidebar/SideBar';
import Navbar from '@/components/navbar/Navbar';

import { PracticeLibrary } from './PracticeLibrary';

export function PracticePage() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'practice'>(
    'practice'
  );

  const completedLessons = 12;
  const totalLessons = 45;

  return (
    <div className="h-screen overflow-hidden">
      <Navbar />
      <AppSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        completedLessons={completedLessons}
        totalLessons={totalLessons}
      />
      <main className="ml-64 h-screen overflow-y-auto pt-14">
        <PracticeLibrary />
      </main>
    </div>
  );
}
