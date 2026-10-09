/* @layer shared-game @kind logic */
import type { StateLabel } from './player-state-labels.type';
import { STATE_LABELS } from './state-labels';

const labelFor = (action: number): StateLabel =>
  STATE_LABELS.find((s) => s.action === action) ??
  { action, label: `Action 0x${action.toString(16).padStart(2, '0')}`, group: 'special', from: 'unlabelled' };

export { labelFor };
