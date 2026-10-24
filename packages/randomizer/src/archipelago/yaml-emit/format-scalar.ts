/* @layer shared-game @kind logic */
import { formatString } from './format-string';

const formatScalar = (value: unknown): string => {
  if (value === null || value === undefined) return 'null';
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : 'null';
  return formatString(String(value));
};

export { formatScalar };
