/* @layer tests @kind helper */
import { createEngineState } from '@rotp/navigation';

const freshState = () => createEngineState({ screenId: 'A', tile: { row: 0, col: 0 } }, new Set(), {});

export { freshState };
