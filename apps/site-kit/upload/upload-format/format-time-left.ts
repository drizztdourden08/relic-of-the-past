/* @layer site-kit @kind logic */
import { MS_PER_SECOND, SECONDS_PER_HOUR, SECONDS_PER_MINUTE } from './upload-format.constants';

const formatTimeLeft = (ms: number): string => {
  const seconds = Math.max(1, Math.round(ms / MS_PER_SECOND));
  if (seconds < SECONDS_PER_MINUTE) return `${seconds} s left`;
  if (seconds < SECONDS_PER_HOUR) return `${Math.round(seconds / SECONDS_PER_MINUTE)} min left`;
  const hours = Math.floor(seconds / SECONDS_PER_HOUR);
  const minutes = Math.round((seconds % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE);
  return minutes > 0 ? `${hours} h ${minutes} min left` : `${hours} h left`;
};

export { formatTimeLeft };
