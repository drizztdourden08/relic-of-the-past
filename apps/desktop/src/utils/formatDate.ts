/* @layer renderer-other @kind logic */
/** Shared timestamp formatter — presets replace the per-card duplicated Date logic. */
type DatePreset = 'short' | 'long' | 'session';

const PRESET_OPTS: Record<DatePreset, Intl.DateTimeFormatOptions> = {
  short: { month: 'short', day: 'numeric', year: 'numeric' },
  long: { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' },
  session: { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' },
};

const formatDate = (ts: number, preset: DatePreset = 'short'): string => {
  if (!ts) return 'Never';
  return new Date(ts).toLocaleDateString(undefined, PRESET_OPTS[preset]);
};

export { formatDate };
export type { DatePreset };
