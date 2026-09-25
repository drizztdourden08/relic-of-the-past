/* @layer renderer-hud @kind hook */
/**
 * ms since this clock last turned on - the ONE shared clock every
 * `animation` in the surface samples against (`shared/hud/engine/motion.ts`'s
 * own header explains why one clock, not one per node).
 *
 * `active` is "does at least one placed node carry an `animation` that could
 * possibly be running" - computed by the caller from the SAME `nodes` list it
 * already has, once, so a document with zero animations (every shipped
 * built-in, today) never starts a `requestAnimationFrame` loop at all and
 * this hook costs nothing beyond the one `matchMedia`-free boolean check.
 * That is what keeps the shipped HUD pixel-identical AND free of any new
 * per-frame cost - a rule this file's own existence must not break.
 *
 * `override` IS THE EDITOR'S SCRUB, and nothing else has any business passing
 * it. A number parks this clock at that instant and stops the loop outright,
 * which is how the HUD editor's play/scrub head shows a person 300 ms of
 * ease-out without saving and watching the game
 * (`HudLayoutEditor/behavior/motion-preview.ts`). `undefined`/`null` - every
 * caller in the shipped app - leaves the free-running clock exactly as it was.
 */
import { useEffect, useRef, useState } from 'react';

const useMotionClock = (active: boolean, override?: number | null): number => {
  const [nowMs, setNowMs] = useState(0);
  const startRef = useRef<number | null>(null);
  const parked = typeof override === 'number';

  useEffect(() => {
    if (!active || parked) {
      startRef.current = null;
      return undefined;
    }
    let frame = 0;
    const tick = (t: number): void => {
      if (startRef.current === null) startRef.current = t;
      setNowMs(t - startRef.current);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, parked]);

  if (parked) return Math.max(0, override as number);
  return active ? nowMs : 0;
};

export { useMotionClock };
