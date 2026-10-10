/* @layer renderer-components @kind logic */
import { DASH } from './network-format.constants';
import { wholeSeconds } from './whole-seconds';

const padTwo = (value: number): string => String(value).padStart(2, '0');

const formatSince = (at: number | null, now: number): string => {
  if (at === null) return DASH;
  const total = wholeSeconds(now - at);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  if (hours > 0) return `${hours}h ${padTwo(minutes)}m`;
  return minutes > 0 ? `${minutes}m ${padTwo(total % 60)}s` : `${total}s`;
};

export { formatSince };
