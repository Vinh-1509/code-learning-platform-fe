/* eslint-disable react-refresh/only-export-components */
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import { useNavigate, useLocation } from '@tanstack/react-router';
import { Joyride, type EventData, STATUS, type Step } from 'react-joyride';

import TourTooltip from './TourTooltip';

// hook to wait until all target elements exist in the DOM
// uses MutationObserver with a fallback interval
function useTargetsReady(selectors: string[], enabled: boolean): boolean {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!enabled || selectors.length === 0) {
      const timer = setTimeout(() => setReady(false), 0);
      return () => clearTimeout(timer);
    }

    const allPresent = () =>
      selectors.every((sel) => document.querySelector(sel) !== null);

    // Fast path: elements already exist
    if (allPresent()) {
      const timer = setTimeout(() => setReady(true), 0);
      return () => clearTimeout(timer);
    }

    // defer setting to false to satisfy strict linting rules
    const timer = setTimeout(() => setReady(false), 0);

    // Observe DOM mutations for new nodes
    const observer = new MutationObserver(() => {
      if (allPresent()) {
        setReady(true);
        observer.disconnect();
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // Safety-net interval in case a mutation is missed
    const interval = setInterval(() => {
      if (allPresent()) {
        setReady(true);
        observer.disconnect();
        clearInterval(interval);
      }
    }, 200);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
      clearInterval(interval);
    };
  }, [selectors.join(','), enabled]); // eslint-disable-line react-hooks/exhaustive-deps

  return ready;
}

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
  const [stepIndex, setStepIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // wantRun indicates intent to start, but actual run state waits for DOM targets
  const [wantRun, setWantRun] = useState(() => {
    // auto start if first time
    if (typeof window !== 'undefined') {
      return localStorage.getItem('has_completed_tour') !== 'true';
    }
    return false;
  });

  const navigate = useNavigate();
  const location = useLocation();

  // Track mounted state to avoid setting state after unmount
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Handle window resizing dynamically to adjust step targets and placements
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // configure steps
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

  // check if current step target exists in DOM
  const currentTargetSelectors = React.useMemo(() => {
    const step = tourSteps[stepIndex];
    return step ? [step.target as string] : [];
  }, [stepIndex, isMobile]); // eslint-disable-line react-hooks/exhaustive-deps

  // DOM readiness check: resolves `true` only when current step's target is in the DOM
  const targetsReady = useTargetsReady(currentTargetSelectors, wantRun);

  // actual run state is now fully derived!
  const run = wantRun && targetsReady;

  // resume tour when routing back
  useEffect(() => {
    if (!wantRun) {
      if (
        (location.pathname === '/practice' && stepIndex === 3) ||
        (location.pathname === '/dashboard' && stepIndex === 2)
      ) {
        // use setTimeout to defer state update and satisfy the strict ESLint rule
        const timer = setTimeout(() => setWantRun(true), 0);
        return () => clearTimeout(timer);
      }
    }
  }, [location.pathname, stepIndex, wantRun]);

  // cleanup on unmount
  useEffect(() => {
    return () => {
      setWantRun(false);
    };
  }, []);

  const startTour = useCallback(() => {
    // If not on the dashboard, navigate back to start from step 1
    if (location.pathname !== '/dashboard') {
      void navigate({ to: '/dashboard' });
    }
    setStepIndex(0);
    setWantRun(true);
  }, [location.pathname, navigate]);

  const stopTour = useCallback(() => {
    setWantRun(false);
  }, []);

  const handleJoyrideCallback = useCallback(
    (data: EventData) => {
      const { action, index, status, type } = data;

      // stop on finish/skip/error
      if (
        status === STATUS.FINISHED ||
        status === STATUS.SKIPPED ||
        type === 'error'
      ) {
        setWantRun(false);
        if (type !== 'error') {
          localStorage.setItem('has_completed_tour', 'true');
        }
        setStepIndex(0);
        return;
      }

      if (type === 'step:after' && action === 'next') {
        if (index === 2) {
          // pause tour during route change
          setWantRun(false);
          setStepIndex(3);
          void navigate({ to: '/practice' });
        } else {
          setStepIndex(index + 1);
        }
      } else if (type === 'step:after' && action === 'prev') {
        if (index === 3) {
          // going back from practice to dashboard
          setWantRun(false);
          setStepIndex(2);
          void navigate({ to: '/dashboard' });
        } else {
          setStepIndex(index - 1);
        }
      }
    },
    [navigate]
  );

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
