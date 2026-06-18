import { useState } from 'react';
import { AppSidebar } from '../../components/sidebar/Sidebar';
import Navbar from '@/components/navbar/Navbar';
import { PracticeLibrary } from './PracticeLibrary';

export function PracticePage() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'practice'>(
    'practice'
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // App metrics state properties values indicators
  const completedLessons = 12;
  const totalLessons = 45;

  return (
    <div className="h-screen overflow-hidden bg-background">
      <Navbar variant="dashboard" />
      <AppSidebar
        activeTab={activeTab}
        onTabChange={(tab: 'dashboard' | 'practice') => {
          setActiveTab(tab);
          setIsSidebarOpen(false);
        }}
        completedLessons={completedLessons}
        totalLessons={totalLessons}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      {/* Scrollable View Workspace Shell */}
      <main className="ml-64 h-screen overflow-y-auto pt-14">
        <PracticeLibrary />
      </main>
    </div>
  );
}
