/* @layer renderer-components @kind logic */
/** Text for the network tab's values: a dash for anything the room has not said. */

const DASH = '-';

const seconds = (ms: number): number => Math.max(0, Math.floor(ms / 1000));

const pad = (value: number): string => String(value).padStart(2, '0');

/** Whole seconds since |at|. */
const formatAge = (at: number | null, now: number): string => (at === null ? DASH : `${seconds(now - at)} s ago`);

/** Whole seconds until |at|. */
const formatCountdown = (at: number | null, now: number): string => (at === null ? DASH : `${seconds(at - now)} s`);

/** Time since |at|, as 12s, 3m 05s or 1h 02m. */
const formatSince = (at: number | null, now: number): string => {
  if (at === null) return DASH;
  const total = seconds(now - at);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  if (hours > 0) return `${hours}h ${pad(minutes)}m`;
  return minutes > 0 ? `${minutes}m ${pad(total % 60)}s` : `${total}s`;
};

const formatMs = (ms: number | null): string => (ms === null ? DASH : `${ms} ms`);

const formatValue = (value: string | number | null): string => (value === null ? DASH : String(value));

const formatYesNo = (value: boolean | null): string => (value === null ? DASH : value ? 'yes' : 'no');

export { DASH, formatAge, formatCountdown, formatMs, formatSince, formatValue, formatYesNo };
