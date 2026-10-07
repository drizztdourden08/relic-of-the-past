/* @layer renderer-hud @kind hook */
/**
 * The HUD countdown for the layout tree: the tracked reading the `countdown`
 * node draws, and the three numbers the data scope exposes for it (§62).
 *
 * It feeds the SAME store `HudView`'s countdown slot feeds
 * (`hud-countdown-store.ts`), so the length a countdown started from survives the
 * HUD unmounting on the map screens exactly as it does under the Original style.
 * Feeding it twice with one reading changes nothing: the store only moves when a
 * reading moves it.
 */
import { useEffect, useMemo } from 'react';
import { useGameUIStore } from '@app/stores/game-ui-store';
import { useHudCountdownStore } from '@app/stores/hud-countdown-store';
import { useHudSettingsStore } from '@app/stores/hud-settings-store';
import { countdownContentOf } from './countdown-content';
import type { CountdownContent } from './countdown-content';

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
