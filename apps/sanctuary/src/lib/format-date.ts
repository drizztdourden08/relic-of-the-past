/* @layer sanctuary-site @kind logic */
/**
 * Dates as the site shows them: a plain calendar day for "linked 2026-09-20" and a
 * short distance for "last seen 2 h ago".
 */
const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const pad = (n: number) => String(n).padStart(2, '0');

const formatDay = (ms: number) => {
  const d = new Date(ms);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

/** `2026-09-23 14:02`: sorts as text in the order it reads, so a table column can hold it. */
const formatDateTime = (ms: number) => {
  const d = new Date(ms);
  return `${formatDay(ms)} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const formatAgo = (ms: number, now = Date.now()) => {
  const delta = Math.max(0, now - ms);
  if (delta < MINUTE) return 'just now';
  if (delta < HOUR) return `${Math.floor(delta / MINUTE)} min ago`;
  if (delta < DAY) return `${Math.floor(delta / HOUR)} h ago`;
  if (delta < 2 * DAY) return 'yesterday';
  if (delta < 30 * DAY) return `${Math.floor(delta / DAY)} d ago`;
  return formatDay(ms);
};

export { formatDay, formatDateTime, formatAgo };
