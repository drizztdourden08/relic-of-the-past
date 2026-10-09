/* @layer tests @kind helper */
import { createEngineState } from '../../../shared/game/simulation/engine/state';
import { SEWERS_SCREEN } from './dungeon-ledger.constants';

const freshState = (screenId = SEWERS_SCREEN) => createEngineState({ screenId, tile: { row: 0, col: 0 } }, new Set(), {});

export { freshState };
