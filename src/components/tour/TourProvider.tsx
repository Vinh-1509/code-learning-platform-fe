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
import {
  Joyride,
  type EventData,
  STATUS,
  type Step,
  ACTIONS,
  EVENTS,
} from 'react-joyride';

import TourTooltip from './TourTooltip';

// hook to wait until all target elements exist in the DOM
// uses MutationObserver with a fallback interval
function useTargetsReady(selectors: string[], enabled: boolean): boolean {
  const key = selectors.join(',');
  const [state, setState] = useState<{ key: string; ready: boolean }>({
    key,
    ready: false,
  });

  if (state.key !== key) {
    setState({ key, ready: false });
  }

  useEffect(() => {
    if (!enabled || selectors.length === 0) {
      return;
    }

    const isVisible = (el: Element) =>
      (el as HTMLElement).offsetParent !== null;

    const allPresent = () =>
      selectors.every((sel) => {
        const el = document.querySelector(sel);
        return el !== null && isVisible(el);
      });

    let cancelled = false;

    // All setState calls below happen inside a callback (timer/observer),
    // never synchronously in the effect body itself — that's what the
    // "avoid calling setState directly within an effect" rule wants.
    const checkTimer = setTimeout(() => {
      if (!cancelled && allPresent()) {
        setState({ key, ready: true });
      }
    }, 0);

    const observer = new MutationObserver(() => {
      if (!cancelled && allPresent()) {
        setState({ key, ready: true });
        observer.disconnect();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class'],
    });

    const interval = setInterval(() => {
      if (!cancelled && allPresent()) {
        setState({ key, ready: true });
        observer.disconnect();
        clearInterval(interval);
      }
    }, 200);

    return () => {
      cancelled = true;
      clearTimeout(checkTimer);
      observer.disconnect();
      clearInterval(interval);
    };
  }, [key, enabled]); // eslint-disable-line react-hooks/exhaustive-deps

  return state.key === key ? state.ready : false;
}

interface TourContextType {
  run: boolean;
  wantRun: boolean;
  stepIndex: number;
  startTour: () => void;
  stopTour: () => void;
  setStepIndex: (index: number) => void;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

/**
 * Waypoints the tour can resume from after a cross-route pause.
 * Each entry says: "if the URL matches AND the tour is parked at this
 * stepIndex, it's safe to start polling for that step's DOM target again."
 */
const RESUME_WAYPOINTS: {
  match: (pathname: string) => boolean;
  stepIndex: number;
}[] = [
  { match: (p) => p === '/dashboard', stepIndex: 2 },
  { match: (p) => p.startsWith('/lesson/'), stepIndex: 3 },
  { match: (p) => p === '/practice', stepIndex: 5 },
  { match: (p) => p === '/practice', stepIndex: 6 },
  { match: (p) => p === '/leaderboard', stepIndex: 7 },
];

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
      setIsMobile(window.innerWidth < 1024); // match Tailwind `lg:` breakpoint
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
        ? 'Tap this menu to open the sidebar. From there you can switch between Dashboard, Practice, and the Leaderboard to see how you rank against everyone else.'
        : 'Access the Dashboard, Practice arena, and global Leaderboard from here. Keep track of your overall language mastery progress at a glance.',
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
      // index 2 — learning-roadmap
      target: '[data-tour="learning-roadmap"]',
      title: 'Personalized Learning Roadmap',
      content:
        "This timeline lays out your direct path to coding mastery. Click on any active module to open it and start a lesson — we'll pick the tour back up once you're inside.",
      placement: 'top',
      blockTargetInteraction: false,
      skipBeacon: true,
      overlayClickAction: false,
      buttons: ['skip', 'back'],
    },
    {
      // index 3 — lesson-theory
      target: isMobile
        ? '[data-tour="lesson-theory-mobile"]'
        : '[data-tour="lesson-theory"]',
      title: 'Theory & Examples',
      content:
        'Here you\u2019ll find the concept explanation and worked code examples for this block. Read through it before jumping into practice.',
      placement: isMobile ? 'bottom' : 'right',
      blockTargetInteraction: false,
      skipBeacon: true,
      overlayClickAction: false,
      spotlightPadding: isMobile ? 4 : 8,
      buttons: ['skip', 'back', 'primary'],
    },
    {
      // index 4 — lesson-practice
      target: isMobile
        ? '[data-tour="lesson-practice-mobile"]'
        : '[data-tour="lesson-practice"]',
      title: 'Practice Exercises',
      content:
        "Solve the exercises here to lock in what you just learned. Once you pass them all, you'll unlock a quick AI check-in that asks you to explain the concept back in your own words. Click Next to view the practice overview page!",
      placement: isMobile ? 'bottom' : 'left',
      blockTargetInteraction: false,
      skipBeacon: true,
      overlayClickAction: false,
      spotlightPadding: isMobile ? 4 : 8,
      buttons: ['skip', 'back', 'primary'],
    },
    {
      // index 5 — practice-filters
      target: '[data-tour="practice-filters"]',
      title: 'Practice Library',
      content:
        "Here's the practice library where you can find tailored exercises recommended to strengthen your tracked weaknesses, and filter coding challenges by difficulty or sort them to test your limits!",
      placement: 'bottom',
      blockTargetInteraction: false,
      skipBeacon: true,
      overlayClickAction: false,
      buttons: ['skip', 'back', 'primary'],
    },
    {
      // index 6 — locked-exercise
      target: '[data-tour="locked-exercise"]',
      title: 'Locked Exercises',
      content:
        "Some exercises are locked until you finish the related lesson. Complete the lesson it's tied to and it'll unlock automatically here. One last stop — let's check the leaderboard!",
      placement: 'top',
      blockTargetInteraction: false,
      skipBeacon: true,
      overlayClickAction: false,
      spotlightPadding: 6,
      buttons: ['skip', 'back', 'primary'],
    },
    {
      // index 7 — leaderboard-hero (new final step)
      target: '[data-tour="leaderboard-hero"]',
      title: 'Global Leaderboard',
      content:
        "Here's how you stack up against everyone else. Every correct exercise spins the rewards wheel for CS-Points — and sometimes unlocks a chance to raid another student's coins, so climb carefully!",
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

  // resume tour when routing back to a known waypoint for the parked step
  useEffect(() => {
    if (!wantRun) {
      const waypoint = RESUME_WAYPOINTS.find(
        (w) => w.match(location.pathname) && w.stepIndex === stepIndex
      );
      if (waypoint) {
        // use setTimeout to defer state update and satisfy the strict ESLint rule
        const timer = setTimeout(() => setWantRun(true), 0);
        return () => clearTimeout(timer);
      }
    }
  }, [location.pathname, stepIndex, wantRun]);

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

      // stop on finish/skip
      if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
        setWantRun(false);
        localStorage.setItem('has_completed_tour', 'true');
        setStepIndex(0);
        return;
      }

      if (action === ACTIONS.CLOSE) {
        setWantRun(false);
        setStepIndex(0);
        return;
      }

      if (type === EVENTS.TARGET_NOT_FOUND) {
        const isFinalStep = index === tourSteps.length - 1;
        if (isFinalStep) {
          setWantRun(false);
          localStorage.setItem('has_completed_tour', 'true');
          setStepIndex(0);
        }
        return;
      }

      if (type === 'error') {
        setWantRun(false);
        setStepIndex(0);
        return;
      }

      if (type === 'step:after' && action === 'next') {
        const isFinalStep = index === tourSteps.length - 1;
        if (index === 2) {
          setWantRun(false);
          setStepIndex(3);
        } else if (index === 4) {
          setWantRun(false);
          setStepIndex(5);
          void navigate({ to: '/practice' });
        } else if (index === 6) {
          // locked-exercise → drive navigation to the Leaderboard page ourselves,
          // same pattern as the lesson-practice → practice-filters jump.
          setWantRun(false);
          setStepIndex(7);
          void navigate({ to: '/leaderboard' });
        } else if (isFinalStep) {
          setWantRun(false);
          localStorage.setItem('has_completed_tour', 'true');
          setStepIndex(0);
        } else {
          setStepIndex(index + 1);
        }
      } else if (type === 'step:after' && action === 'prev') {
        if (index === 3) {
          setWantRun(false);
          setStepIndex(2);
          void navigate({ to: '/dashboard' });
        } else if (index === 5) {
          setWantRun(false);
          setStepIndex(2);
          void navigate({ to: '/dashboard' });
        } else if (index === 7) {
          // leaderboard-hero → back to Practice (locked-exercise step)
          setWantRun(false);
          setStepIndex(6);
          void navigate({ to: '/practice' });
        } else {
          setStepIndex(index - 1);
        }
      }
    },
    [navigate, tourSteps.length]
  );

  useEffect(() => {
    if (stepIndex === 2 && location.pathname.startsWith('/lesson/')) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStepIndex(3);
      setWantRun(true);
    }
  }, [location.pathname, stepIndex]);

  return (
    <TourContext.Provider
      value={{ run, wantRun, stepIndex, startTour, stopTour, setStepIndex }}
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
