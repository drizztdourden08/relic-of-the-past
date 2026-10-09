/* @layer tests @kind helper */
import { createEngineState } from '../../../shared/game/simulation/engine/state';

const freshState = () => createEngineState({ screenId: 'A', tile: { row: 0, col: 0 } }, new Set(), {});

export { freshState };
