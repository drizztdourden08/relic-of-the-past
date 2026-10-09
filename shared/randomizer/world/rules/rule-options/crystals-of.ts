/* @layer shared-game @kind logic */
import { ORIGINAL_CRYSTAL_COUNT } from './rule-options-base.constants';
import type { CountGate } from '../../story-gates/story-gate.type';

const crystalsOf = (gate: CountGate): number => (gate.count === 0 ? ORIGINAL_CRYSTAL_COUNT : gate.count);

export { crystalsOf };
