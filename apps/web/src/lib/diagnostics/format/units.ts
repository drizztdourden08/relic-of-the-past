/* @layer renderer-lib @kind logic */
/** Formatting helpers for the debug-info block: compact, stable, no locale
 *  separators (the text gets pasted into reports and diffed by eye). */

const GIB = 1024 ** 3;

const gib = (bytes: number): string => `${(bytes / GIB).toFixed(1)} GiB`;

const mib = (bytes: number): string => `${Math.round(bytes / (1024 * 1024))} MiB`;

const ghz = (mhz: number): string => (mhz > 0 ? `${(mhz / 1000).toFixed(2)} GHz` : 'unknown');

const ms = (value: number | null): string => (value === null ? '—' : `${value.toFixed(1)} ms`);

const duration = (seconds: number): string => {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (days) return `${days}d ${hours}h`;
  if (hours) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};

const hex = (value: number): string => `0x${value.toString(16).toUpperCase().padStart(4, '0')}`;

const yesNo = (value: boolean): string => (value ? 'yes' : 'no');

const orDash = (value: string | number | null | undefined): string =>
  value === null || value === undefined || value === '' ? '—' : String(value);

export { gib, mib, ghz, ms, duration, hex, yesNo, orDash };
