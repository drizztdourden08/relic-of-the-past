/* @layer shared-game @kind logic */
import { formatById } from '../format-by-id';
import type { StateStamp } from '../save-state.type';

const describeStamp = (stamp: StateStamp | null): string | null => {
  if (!stamp) return null;
  const known = formatById(stamp.formatId);
  return known ? `${stamp.app} (format ${stamp.formatId})` : `${stamp.app} (unrecognised format)`;
};

export { describeStamp };
