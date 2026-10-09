/* @layer renderer-components @kind logic */
import type { Chip } from './network-tone.type';

const offlineChip = (hasLastSession: boolean): Chip =>
  (hasLastSession ? { tone: 'info', label: 'last session' } : { tone: 'neutral', label: 'not connected' });

export { offlineChip };
