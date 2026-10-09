/* @layer renderer-components @kind constants */
import { OUTFIT_IDS } from '@shared/game/data/player-sheet/types';
import { GLOVE_LABELS, GLOVE_LEVELS, OUTFIT_LABELS } from '../../behavior/useWearing';

const OUTFIT_OPTIONS = OUTFIT_IDS.map((id) => ({ value: id, label: OUTFIT_LABELS[id] }));
const GLOVE_OPTIONS = GLOVE_LEVELS.map((g) => ({ value: String(g), label: GLOVE_LABELS[g] }));

export { GLOVE_OPTIONS, OUTFIT_OPTIONS };
