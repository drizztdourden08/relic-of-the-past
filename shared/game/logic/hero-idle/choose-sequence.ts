/* @layer shared-game @kind logic */
import type { HeroRng, HeroSequenceDef } from './hero-idle.type';
import { REPEATABLE } from './hero-idle.constants';
import { pickWeighted } from './pick-weighted';
import { HERO_SEQUENCES } from './sequence-table';

const chooseSequence = (rng: HeroRng, previous: string | null): HeroSequenceDef => {
  const options = HERO_SEQUENCES.filter(
    (def) => def.id !== previous || REPEATABLE.has(def.id));
  const from = options.length > 0 ? options : HERO_SEQUENCES;
  return pickWeighted(rng, from, (def) => def.weight);
};

export { chooseSequence };
