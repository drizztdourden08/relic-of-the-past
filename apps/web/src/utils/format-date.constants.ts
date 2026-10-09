/* @layer renderer-other @kind constants */
import type { DatePreset } from './format-date.type';

const PRESET_OPTS: Record<DatePreset, Intl.DateTimeFormatOptions> = {
  short: { month: 'short', day: 'numeric', year: 'numeric' },
  long: { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' },
  session: { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' },
};

export { PRESET_OPTS };
