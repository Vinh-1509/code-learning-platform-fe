import { useEffect, useState } from 'react';
import { ACTIONS, type EventData, STATUS } from 'react-joyride';

const STORAGE_KEY = 'has_seen_feynman_intro';
const TARGET_SELECTOR = '[data-tour="feynman-pane"]';

export function useFeynmanIntro(isReady: boolean) {
  const [run, setRun] = useState(false);

  useEffect(() => {
    if (!isReady) return;
    if (typeof window === 'undefined') return;
    if (localStorage.getItem(STORAGE_KEY) === 'true') return;

    const isVisible = (el: Element) =>
      (el as HTMLElement).offsetParent !== null;
    const targetVisible = () => {
      const el = document.querySelector(TARGET_SELECTOR);
      return el !== null && isVisible(el);
    };

    let cancelled = false;

    // Same reasoning as the main tour: don't trust a fixed timeout,
    // since on mobile the target can be behind a hidden tab. Poll
    // (via MutationObserver + interval, both are callbacks so this
    // stays effect-safe) until it's actually on screen.
    const checkTimer = setTimeout(() => {
      if (!cancelled && targetVisible()) setRun(true);
    }, 400);

    const observer = new MutationObserver(() => {
      if (!cancelled && targetVisible()) {
        setRun(true);
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
      if (!cancelled && targetVisible()) {
        setRun(true);
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
  }, [isReady]);

  const handleCallback = (data: EventData) => {
    const { status, action } = data;

    if (
      status === STATUS.FINISHED ||
      status === STATUS.SKIPPED ||
      action === ACTIONS.CLOSE
    ) {
      localStorage.setItem(STORAGE_KEY, 'true');
      setRun(false);
    }
  };

  return { run, handleCallback };
}
