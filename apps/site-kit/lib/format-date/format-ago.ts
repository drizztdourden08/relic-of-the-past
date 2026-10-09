/* @layer site-kit @kind logic */
import { DAY, HOUR, MINUTE } from './format-date.constants';
import { formatDay } from './format-day';

const formatAgo = (ms: number, now = Date.now()) => {
  const delta = Math.max(0, now - ms);
  if (delta < MINUTE) return 'just now';
  if (delta < HOUR) return `${Math.floor(delta / MINUTE)} min ago`;
  if (delta < DAY) return `${Math.floor(delta / HOUR)} h ago`;
  if (delta < 2 * DAY) return 'yesterday';
  if (delta < 30 * DAY) return `${Math.floor(delta / DAY)} d ago`;
  return formatDay(ms);
};

export { formatAgo };
