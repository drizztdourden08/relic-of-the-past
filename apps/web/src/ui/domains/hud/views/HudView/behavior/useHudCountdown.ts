/* @layer renderer-hud @kind hook */
/** Feeds the game's countdown reading into the countdown store and hands back the tracked result. */
import { useEffect } from 'react';
import { useGameUIStore } from '../../../../../../stores/game-ui-store';
import { useHudCountdownStore } from '../../../../../../stores/hud-countdown-store';

const useHudCountdown = () => {
  const seconds = useGameUIStore((s) => s.countdown.seconds);
  const frames = useGameUIStore((s) => s.countdown.frames);
  const isRunning = useGameUIStore((s) => s.countdown.isRunning);
  const isIndoors = useGameUIStore((s) => s.map.isIndoors);
  const track = useHudCountdownStore((s) => s.track);
  const advance = useHudCountdownStore((s) => s.advance);

  useEffect(() => {
    advance({ seconds, frames, isRunning, isIndoors });
  }, [advance, seconds, frames, isRunning, isIndoors]);

  return { track };
};

export { useHudCountdown };
