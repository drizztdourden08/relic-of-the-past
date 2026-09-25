/* @layer renderer-hud @kind hook */
/**
 * The clock behind the idle sequencer.
 *
 * The sequencer itself is pure and lives in `@shared/game/logic/hero-idle`; it
 * knows nothing about frames arriving, only about what a given value of a
 * clock means. This is the half that supplies the clock, and it counts in GAME
 * frames (sixtieths of a second) because every hold in the sequence table was
 * transcribed from the engine's own per-frame counters. Driving it at anything
 * else would be a different character walking.
 *
 * It re-renders only when the drawn pose actually changes. The clock ticks at
 * the display's rate, which can be 120 or 144 here, while the poses underneath
 * it change perhaps fifteen times a second, so the state setter returns the
 * previous object whenever nothing moved and React bails out of the render.
 *
 * The take is re-rolled from scratch on every open. A menu re-opened onto the
 * pose it was closed on would look like a paused video; re-opening onto a
 * different one is what makes the character read as alive instead of as a
 * loop.
 */
import { useEffect, useRef, useState } from 'react';
import { advanceHeroIdle, heroPoseAt, startHeroIdle } from '@shared/game/logic/hero-idle';
import type { HeroIdleState, HeroPose } from '@shared/game/logic/hero-idle';

/** The engine's frame rate, which is the unit every hold in the table is written in. */
const GAME_FPS = 60;

/** Standing, facing the viewer: what is drawn before the first tick lands. */
const AT_REST: HeroPose = { action: 0x00, frame: 0, facing: 1, offsetX: 0, offsetY: 0 };

const samePose = (a: HeroPose, b: HeroPose): boolean =>
  a.action === b.action && a.frame === b.frame && a.facing === b.facing
  && a.offsetX === b.offsetX && a.offsetY === b.offsetY;

const useHeroIdle = (active: boolean): HeroPose => {
  const [pose, setPose] = useState<HeroPose>(AT_REST);
  const idle = useRef<HeroIdleState | null>(null);

  useEffect(() => {
    if (!active) {
      idle.current = null;
      setPose(AT_REST);
      return;
    }
    const rng = Math.random;
    const openedAt = performance.now();
    idle.current = startHeroIdle(0, rng);
    setPose(heroPoseAt(idle.current, 0));

    let raf = 0;
    const step = (now: number): void => {
      const frame = Math.floor(((now - openedAt) / 1000) * GAME_FPS);
      const next = advanceHeroIdle(idle.current ?? startHeroIdle(frame, rng), frame, rng);
      idle.current = next;
      const drawn = heroPoseAt(next, frame);
      setPose((prev) => (samePose(prev, drawn) ? prev : drawn));
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [active]);

  return pose;
};

export { AT_REST, GAME_FPS, useHeroIdle };
