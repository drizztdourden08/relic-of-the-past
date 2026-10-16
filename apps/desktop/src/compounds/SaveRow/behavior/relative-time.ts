/* @layer renderer-components @kind logic */
import { JUST_NOW_LABEL, RELATIVE_UNITS } from '../SaveRow.constants';

const format = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });

const relativeTime = (timestamp: number, now: number): string => {
  const seconds = (timestamp - now) / 1000;
  const unit = RELATIVE_UNITS.find(([, size]) => Math.abs(seconds) >= size);
  if (!unit) return JUST_NOW_LABEL;
  const [name, size] = unit;
  return format.format(Math.round(seconds / size), name);
};

export { relativeTime };
