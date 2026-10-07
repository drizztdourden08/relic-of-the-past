/* @layer site-kit @kind logic */
/** How an upload's numbers read: "147 of 312 MB", "6.8 MB/s", "25 s left". */
import { formatBytes } from '../lib/format-bytes';

const S = 1000;
const MINUTE = 60;
const HOUR = 60 * MINUTE;

/** "147 of 312 MB" when both share a unit, "900 KB of 312 MB" when not. */
const formatProgress = (sent: number, total: number): string => {
  const done = formatBytes(sent);
  const whole = formatBytes(total);
  const [doneValue, doneUnit] = done.split(' ');
  const [, wholeUnit] = whole.split(' ');
  return doneUnit === wholeUnit ? `${doneValue} of ${whole}` : `${done} of ${whole}`;
};

const formatRate = (bytesPerSecond: number): string => `${formatBytes(bytesPerSecond)}/s`;

const formatTimeLeft = (ms: number): string => {
  const seconds = Math.max(1, Math.round(ms / S));
  if (seconds < MINUTE) return `${seconds} s left`;
  if (seconds < HOUR) return `${Math.round(seconds / MINUTE)} min left`;
  const hours = Math.floor(seconds / HOUR);
  const minutes = Math.round((seconds % HOUR) / MINUTE);
  return minutes > 0 ? `${hours} h ${minutes} min left` : `${hours} h left`;
};

/** "147 of 312 MB · 6.8 MB/s", the speed left out while it is not known. */
const formatTransfer = (sent: number, total: number, bytesPerSecond: number | null): string =>
  (bytesPerSecond && bytesPerSecond > 0 ? `${formatProgress(sent, total)} · ${formatRate(bytesPerSecond)}` : formatProgress(sent, total));

export { formatProgress, formatRate, formatTimeLeft, formatTransfer };
