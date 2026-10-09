/* @layer shared-game @kind logic */
import { CURRENT_STATE_FORMAT } from '../current-format.constants';
import type { TargetCompat } from '../save-state.type';

const compareTargetFormat = (targetId: string): TargetCompat =>
  targetId === CURRENT_STATE_FORMAT.id ? { kind: 'compatible' } : { kind: 'incompatible', targetId };

export { compareTargetFormat };
