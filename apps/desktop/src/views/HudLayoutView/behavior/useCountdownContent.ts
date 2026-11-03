/* @layer renderer-hud @kind hook */
import { useMemo } from 'react';
import { useCountdownTrack } from '@app/hooks/useCountdownTrack';
import { useHudSettingsStore } from '@app/stores/hud-settings-store';
import { countdownContentOf } from './countdown-content';
import type { CountdownContent } from '../HudLayoutView.type';

const useCountdownContent = (): CountdownContent => {
  const { track, frames } = useCountdownTrack();
  const variant = useHudSettingsStore((s) => s.countdownStyle);

  return useMemo(() => countdownContentOf(track, frames, variant), [frames, track, variant]);
};

export { useCountdownContent };
