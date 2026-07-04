import { Joyride, type EventData } from 'react-joyride';
import TourTooltip from './TourTooltip';

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
          target: '[data-tour="feynman-header"]',
          title: 'Explain It Back — Feynman Technique',
          content:
            'Nice work finishing the exercises! Now explain the concept in your own words to the AI. When you answer correctly, the next lesson will be unlocked! Good luck!',
          placement: 'bottom',
          skipBeacon: true,
          overlayClickAction: false,
          blockTargetInteraction: false,
          spotlightPadding: 6,
          buttons: ['primary'],
        },
      ]}
      run={run}
      continuous={false}
      scrollToFirstStep
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
