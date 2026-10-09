/* @layer shared-game @kind logic */
import type { Facing } from '../../data/native-tables/player-pose-atlas';
import type { HeroBeat, HeroRng } from './hero-idle.type';
import { LOOK_TURNS } from './hero-idle.constants';
import { otherFacing } from './other-facing';
import { pickInt } from './pick-int';
import { stillBeat } from './still-beat';

const buildLookTake = (rng: HeroRng, facing: Facing, frames: number): HeroBeat[] => {
  const turns = pickInt(rng, LOOK_TURNS[0], LOOK_TURNS[1]);
  const hold = Math.max(1, Math.round(frames / turns));
  const beats: HeroBeat[] = [];
  let at = facing;
  for (let turn = 0; turn < turns; turn++) {
    at = otherFacing(rng, at);
    beats.push(stillBeat(at, hold));
  }
  return beats;
};

export { buildLookTake };
