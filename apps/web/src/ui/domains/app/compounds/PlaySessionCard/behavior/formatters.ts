/* @layer renderer-components @kind logic */
import { formatDate as fmtDate } from '../../../../../../utils/formatDate';

const formatSessionDate = (ts: number): string => fmtDate(ts, 'session');

const formatDuration = (ms: number): string => {
  const totalMin = Math.floor(ms / 60000);
  if (totalMin < 60) return `${totalMin}m`;
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
};

export { formatDuration, formatSessionDate };
