/* @layer renderer-components @kind logic */
import type { Chip } from './network-tone.type';

const onlineChip = (online: boolean | null): Chip => {
  if (online === null) return { tone: 'neutral', label: 'unknown' };
  return online ? { tone: 'success', label: 'online' } : { tone: 'neutral', label: 'offline' };
};

export { onlineChip };
