import { Joyride, type EventData } from 'react-joyride';
import TourTooltip from './TourTooltip';

/**
 * Standalone, one-shot spotlight for the Feynman pane.
 * Deliberately NOT part of TourProvider's stepIndex state machine — it's
 * triggered by "the Feynman pane mounted for the first time", not by a
 * route waypoint, so it needs none of the pause/resume machinery.
 */
export function FeynmanIntro({
  run,
  onCallback,
}: {
  run: boolean;
  onCallback: (data: EventData) => void;
}) {
  return (
    <Joyride
      steps={[
        {
          target: '[data-tour="feynman-pane"]',
          title: 'Explain It Back — Feynman Technique',
          content:
            'Nice work finishing the exercises! Now explain the concept in your own words to the AI. When you answer correctly, the next lesson will be unlocked! Good luck!',
          placement: 'auto',
          skipBeacon: true,
          overlayClickAction: false,
          blockTargetInteraction: false,
          spotlightPadding: 6,
          buttons: ['primary'],
        },
      ]}
      run={run}
      continuous={false}
      tooltipComponent={TourTooltip}
      styles={{
        overlay: {
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
        },
      }}
      onEvent={onCallback}
    />
  );
}
