/* @layer shared-game @kind logic */
import { defineWorldGame } from '@drizztdourden08/brock-randomizer/world';
import { ROTP_WORLD_KIT } from './rotp-world-kit.constants';
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
  fillPhases: [PRIZES_PHASE, DUNGEON_PREFILL_PHASE, ROTP_WORLD_KIT.mainFill],
  finish: finishPlacement,
});

export { rotpWorldGame };
