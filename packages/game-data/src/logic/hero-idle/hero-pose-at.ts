/* @layer shared-game @kind logic */
import type { HeroIdleState, HeroPose } from './hero-idle.type';
import { REST } from './hero-idle.constants';

const heroPoseAt = (state: HeroIdleState, now: number): HeroPose => {
  const { beats } = state.take;
  const last = beats[beats.length - 1];
  if (last === undefined) return REST;
  let left = Math.max(0, Math.min(now - state.startedAt, state.take.frames - 1));
  let offsetX = 0;
  let offsetY = 0;
  for (const beat of beats) {
    if (left < beat.hold) {
      return {
        action: beat.action,
        frame: beat.frame,
        facing: beat.facing,
        offsetX: offsetX + beat.vx * left,
        offsetY: offsetY + beat.vy * left,
      };
    }
    left -= beat.hold;
    offsetX += beat.vx * beat.hold;
    offsetY += beat.vy * beat.hold;
  }
  return { action: last.action, frame: last.frame, facing: last.facing, offsetX, offsetY };
};

export { heroPoseAt };
