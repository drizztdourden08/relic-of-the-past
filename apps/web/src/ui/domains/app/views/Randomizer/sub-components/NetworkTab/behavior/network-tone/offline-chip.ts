/* @layer renderer-components @kind logic */
import type { Chip } from './network-tone.type';

const offlineChip = (hasLastSession: boolean): Chip =>
  (hasLastSession ? { tone: 'dim', label: 'last session' } : { tone: 'idle', label: 'not connected' });

export { offlineChip };
