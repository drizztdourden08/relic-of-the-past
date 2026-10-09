/* @layer renderer-other @kind logic */
import type { DatePreset } from './format-date.type';
import { PRESET_OPTS } from './format-date.constants';

const formatDate = (ts: number, preset: DatePreset = 'short'): string => {
  if (!ts) return 'Never';
  return new Date(ts).toLocaleDateString(undefined, PRESET_OPTS[preset]);
};

export { formatDate };
export type { DatePreset };
