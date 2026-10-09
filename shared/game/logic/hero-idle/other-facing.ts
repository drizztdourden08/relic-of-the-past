/* @layer shared-game @kind logic */
import { FACINGS } from '../../data/native-tables/player-pose-atlas';
import type { Facing } from '../../data/native-tables/player-pose-atlas';
import type { HeroRng } from './hero-idle.type';
import { pickWeighted } from './pick-weighted';

const otherFacing = (rng: HeroRng, avoid: Facing): Facing => {
  const options = FACINGS.filter((f) => f !== avoid);
  return pickWeighted(rng, options, () => 1);
};

export { otherFacing };
