/* @layer renderer-components @kind logic */
import type { Chip } from './network-tone.type';

const onlineChip = (online: boolean | null): Chip => {
  if (online === null) return { tone: 'dim', label: 'unknown' };
  return online ? { tone: 'ok', label: 'online' } : { tone: 'idle', label: 'offline' };
};

export { onlineChip };
