/* @layer renderer-widgets @kind hook */
/**
 * Re-floods in auto mode when the player's surroundings change. Replaces a polling loop
 * that guessed at "has the transition finished" from latched game-state flags and got it
 * wrong three times in a row (see the House style plan / commit history for the postmortem).
 *
 * Indoor transitions (room, quadrant, door, stairs) are pure event subscription: the core
 * fires window.__onTransitionSettled on the exact frame it considers the room settled (see
 * docs/hooks/transition-events.md), so there is nothing to poll and nothing to wait for.
 *
 * Walking across an overworld screen boundary is the one exception, and it is a real one,
 * not a workaround: ordinary overworld travel is continuous scrolling with no discrete
 * transition at all (overworld_screen_index in WRAM only changes on special-cased area
 * exits, never on a plain screen-cell crossing), so there is no event to subscribe to. That
 * case is derived from the player's live world position instead, which the app's own
 * per-frame UI bridge already keeps current for the HUD, the minimap marker and everything
 * else that needs it. Reacting to that existing state is not a new timer.
 */
import { useEffect, useRef } from 'react';
import { subscribeTransitionSettled } from '../../../../../lib/game';

interface FloodOnTransitionOptions {
  enabled: boolean;
  isIndoors: boolean;
  linkX: number;
  linkY: number;
  onTrigger: () => void;
}

const useFloodOnTransition = (opts: FloodOnTransitionOptions): void => {
  const { enabled, isIndoors, linkX, linkY, onTrigger } = opts;

  // Indoor transitions: subscribe, nothing to poll.
  useEffect(() => {
    if (!enabled) return;
    return subscribeTransitionSettled(onTrigger);
  }, [enabled, onTrigger]);

  // Overworld screen-boundary crossing: derived from the live position, not a new timer.
  const prevLiveScreenRef = useRef<number | null>(null);
  useEffect(() => {
    if (!enabled || isIndoors) {
      prevLiveScreenRef.current = null;
      return;
    }
    const liveScreen = (((linkY >> 9) & 7) << 3) | ((linkX >> 9) & 7);
    if (prevLiveScreenRef.current !== null && prevLiveScreenRef.current !== liveScreen) {
      onTrigger();
    }
    prevLiveScreenRef.current = liveScreen;
  }, [enabled, isIndoors, linkX, linkY, onTrigger]);
};

export { useFloodOnTransition };
