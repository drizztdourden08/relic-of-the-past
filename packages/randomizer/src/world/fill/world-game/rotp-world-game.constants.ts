/* @layer shared-game @kind constants */
import { placePrizes } from '../place-prizes';
import { prefillDungeonItems } from '../dungeon-fill';
import type { FillPhase } from '@drizztdourden08/brock-randomizer/world';
import type { RotpBuild } from './rotp-world-game.type';

const WORLD_SCHEMA = 'rotp-world-v1';

const PRIZES_PHASE: FillPhase<RotpBuild> = {
  id: 'prizes',
  run: (build, rng) => placePrizes(build.fillWorld, build.shufflePrizes, rng),
};

const DUNGEON_PREFILL_PHASE: FillPhase<RotpBuild> = {
  id: 'dungeon-prefill',
  run: (build, rng) => prefillDungeonItems(build.fillWorld, rng),
};

export { DUNGEON_PREFILL_PHASE, PRIZES_PHASE, WORLD_SCHEMA };
