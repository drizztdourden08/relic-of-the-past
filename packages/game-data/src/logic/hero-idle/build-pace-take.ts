/* @layer shared-game @kind logic */
import type { Facing } from '../../data/native-tables/player-pose-atlas';
import type { HeroBeat, HeroRng } from './hero-idle.type';
import { MAX_LEG_CYCLES, STEP_BY_FACING } from './hero-idle.constants';
import { ACTION_WALK, WALK_CYCLE_FRAMES, WALK_FRAMES, WALK_HOLDS } from './native-timings';
import { opposite } from './opposite';

const walkCycle = (facing: Facing): HeroBeat[] => {
  const step = STEP_BY_FACING[facing];
  return WALK_FRAMES.map((frame, index) => ({
    action: ACTION_WALK,
    frame,
    facing,
    hold: WALK_HOLDS[index],
    vx: step.x,
    vy: step.y,
  }));
};

const repeat = <T>(count: number, make: (index: number) => T[]): T[] =>
  Array.from({ length: count }, (_unused, index) => make(index)).flat();

const buildPaceTake = (rng: HeroRng, facing: Facing, frames: number): HeroBeat[] => {
  const wanted = Math.max(2, Math.round(frames / WALK_CYCLE_FRAMES));
  const legCycles = Math.max(1, Math.min(MAX_LEG_CYCLES, Math.floor(wanted / 2)));
  const pairs = Math.max(1, Math.round(wanted / (2 * legCycles)));
  const back = opposite(facing);
  return repeat(pairs, () => [
    ...repeat(legCycles, () => walkCycle(facing)),
    ...repeat(legCycles, () => walkCycle(back)),
  ]);
};

export { buildPaceTake };
