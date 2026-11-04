/* @layer shared-game @kind logic */
import { MAIN_FILL, defineWorldGame } from '@drizztdourden08/brock-randomizer/world';
import { OPTION_SCHEMAS } from '../options-snapshot/options-snapshot.constants';
import { PLACEMENT_SCHEMAS } from '../placement-io/randomizer-placement-io.constants';
import {
  DUNGEON_PREFILL_PHASE, PRIZES_PHASE, WORLD_SCHEMA, buildPlacementAttempt, finishPlacement, preparePlacement,
} from './fill/world-game';
import type { RotpGameTypes } from './fill/world-game';

const rotpWorldGame = defineWorldGame<RotpGameTypes>({
  game: 'rotp',
  worldSchema: WORLD_SCHEMA,
  placementSchemas: PLACEMENT_SCHEMAS,
  optionSchemas: OPTION_SCHEMAS,
  prepare: preparePlacement,
  build: buildPlacementAttempt,
  fillPhases: [PRIZES_PHASE, DUNGEON_PREFILL_PHASE, MAIN_FILL],
  finish: finishPlacement,
});

export { rotpWorldGame };
