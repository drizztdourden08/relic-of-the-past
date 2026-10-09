/* @layer renderer-hud @kind hook */
import { useEffect, useMemo } from 'react';
import { useGameUIStore } from '@app/stores/game-ui-store';
import { useHudCountdownStore } from '@app/stores/hud-countdown-store';
import { useHudSettingsStore } from '@app/stores/hud-settings-store';
import { countdownContentOf } from './countdown-content';
import type { CountdownContent } from '../HudLayoutView.type';

const useCountdownContent = (): CountdownContent => {
  const seconds = useGameUIStore((s) => s.countdown.seconds);
  const frames = useGameUIStore((s) => s.countdown.frames);
  const isRunning = useGameUIStore((s) => s.countdown.isRunning);
  const isIndoors = useGameUIStore((s) => s.map.isIndoors);
  const track = useHudCountdownStore((s) => s.track);
  const advance = useHudCountdownStore((s) => s.advance);
  const variant = useHudSettingsStore((s) => s.countdownStyle);

  useEffect(() => {
    advance({ seconds, frames, isRunning, isIndoors });
  }, [advance, seconds, frames, isRunning, isIndoors]);

  return useMemo(() => countdownContentOf(track, frames, variant), [frames, track, variant]);
};

export { useCountdownContent };
