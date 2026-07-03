/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from '@tanstack/react-router';
import { Joyride, type EventData, STATUS, type Step } from 'react-joyride';

import TourTooltip from './TourTooltip';

interface TourContextType {
  run: boolean;
  stepIndex: number;
  startTour: () => void;
  stopTour: () => void;
  setStepIndex: (index: number) => void;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

export const TourProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [run, setRun] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Handle window resizing dynamically to adjust step targets and placements
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // On mount, check if user has finished/skipped the tour. If not, auto-run.
  useEffect(() => {
    const hasCompleted = localStorage.getItem('has_completed_tour');
    if (hasCompleted !== 'true') {
      // Small delay to ensure initial routes, auth, and layout are hydrated
      const timer = setTimeout(() => {
        setRun(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  // Monitor location and safely resume tour once elements on next route mount
  useEffect(() => {
    if (location.pathname === '/practice' && stepIndex === 3 && !run) {
      const timer = setTimeout(() => {
        setRun(true);
      }, 600); // Allow ample time for TanStack router and Practice Page to mount
      return () => clearTimeout(timer);
    }
    if (location.pathname === '/dashboard' && stepIndex === 2 && !run) {
      const timer = setTimeout(() => {
        setRun(true);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [location.pathname, stepIndex, run]);

  const startTour = () => {
    // If not on the dashboard, navigate back to start from step 1
    if (location.pathname !== '/dashboard') {
      void navigate({ to: '/dashboard' });
    }
    setStepIndex(0);
    setRun(true);
  };

  const stopTour = () => {
    setRun(false);
  };

  const handleJoyrideCallback = (data: EventData) => {
    const { action, index, status, type } = data;

    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      setRun(false);
      localStorage.setItem('has_completed_tour', 'true');
      setStepIndex(0);
    } else if (type === 'step:after' && action === 'next') {
      if (index === 2) {
        // Leaving Step 3 (Learning Roadmap on /dashboard) -> going to Step 4 on /practice
        setRun(false); // Pause tour during route change
        setStepIndex(3);
        void navigate({ to: '/practice' });
      } else {
        setStepIndex(index + 1);
      }
    } else if (type === 'step:after' && action === 'prev') {
      if (index === 3) {
        // Going backward from Step 4 (/practice) -> back to Step 3 on /dashboard
        setRun(false);
        setStepIndex(2);
        void navigate({ to: '/dashboard' });
      } else {
        setStepIndex(index - 1);
      }
    }
  };

  // Define steps dynamically based on view size
  const tourSteps: Step[] = [
    {
      target: isMobile ? '[data-tour="menu-btn"]' : '[data-tour="sidebar-nav"]',
      title: isMobile ? 'Navigation Menu' : 'Sidebar Navigation',
      content: isMobile
        ? 'Tap this menu to open the sidebar. From there you can switch between Dashboard and Practice and track your overall language mastery.'
        : 'Access the Dashboard and Practice arenas from here. Keep track of your overall language mastery progress at a glance.',
      placement: isMobile ? 'bottom' : 'right',
      overlayClickAction: false,
      blockTargetInteraction: true,
      skipBeacon: true,
      buttons: ['skip', 'primary'],
      spotlightPadding: isMobile ? 4 : 8,
    },
    {
      target: '[data-tour="dashboard-stats"]',
      title: 'Your Performance Metrics',
      content:
        'Keep close track of the lessons you have learned and coding exercises you have completed.',
      placement: 'bottom',
      blockTargetInteraction: false,
      skipBeacon: true,
      overlayClickAction: false,
      buttons: ['skip', 'back', 'primary'],
    },
    {
      target: '[data-tour="learning-roadmap"]',
      title: 'Personalized Learning Roadmap',
      content:
        "This timeline lays out your direct path to coding mastery. Click on any active module to expand it and start a lesson! Let's navigate next to the Practice library.",
      placement: 'top',
      blockTargetInteraction: false,
      skipBeacon: true,
      overlayClickAction: false,
      buttons: ['skip', 'back', 'primary'],
    },
    {
      target: '[data-tour="practice-filters"]',
      title: 'Practice Library',
      content:
        'Find tailored exercises recommended to strengthen your tracked weaknesses, and filter coding challenges by difficulty or sort them to test your limits!',
      placement: 'bottom',
      blockTargetInteraction: false,
      skipBeacon: true,
      overlayClickAction: false,
      buttons: ['skip', 'back', 'primary'],
    },
  ];

  return (
    <TourContext.Provider
      value={{ run, stepIndex, startTour, stopTour, setStepIndex }}
    >
      {children}
      <Joyride
        steps={tourSteps}
        run={run}
        stepIndex={stepIndex}
        continuous={true}
        scrollToFirstStep={true}
        tooltipComponent={TourTooltip}
        options={{
          scrollOffset: 100,
        }}
        styles={{
          overlay: {
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
          },
        }}
        onEvent={handleJoyrideCallback}
      />
    </TourContext.Provider>
  );
};

export const useTour = () => {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error('useTour must be used within a TourProvider');
  }
  return context;
};
