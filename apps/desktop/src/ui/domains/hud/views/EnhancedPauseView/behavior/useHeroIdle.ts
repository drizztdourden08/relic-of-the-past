/* @layer renderer-hud @kind hook */
import { useEffect, useRef, useState } from 'react';
import { advanceHeroIdle, heroPoseAt, startHeroIdle } from '@rotp/game-data';
import type { HeroIdleState, HeroPose } from '@rotp/game-data';
import { AT_REST, GAME_FPS } from '../EnhancedPauseView.constants';

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

export { useHeroIdle };
