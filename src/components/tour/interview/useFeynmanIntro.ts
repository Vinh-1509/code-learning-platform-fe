import { useEffect, useState } from 'react';
import { type EventData, STATUS } from 'react-joyride';

const STORAGE_KEY = 'has_seen_feynman_intro';

export function useFeynmanIntro(isReady: boolean) {
  const [run, setRun] = useState(false);

  useEffect(() => {
    if (!isReady) return;
    if (typeof window === 'undefined') return;
    if (localStorage.getItem(STORAGE_KEY) === 'true') return;

    // Small delay so it doesn't fight the pane's own mount/scroll animation
    const timer = setTimeout(() => setRun(true), 400);
    return () => clearTimeout(timer);
  }, [isReady]);

  const handleCallback = (data: EventData) => {
    const { status } = data;
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      localStorage.setItem(STORAGE_KEY, 'true');
      setRun(false);
    }
  };

  return { run, handleCallback };
}
