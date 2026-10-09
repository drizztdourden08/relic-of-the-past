/* @layer tests @kind helper */
import { createEngineState } from '@rotp/navigation';
import { SEWERS_SCREEN } from './dungeon-ledger.constants';

const freshState = (screenId = SEWERS_SCREEN) => createEngineState({ screenId, tile: { row: 0, col: 0 } }, new Set(), {});

export { freshState };
