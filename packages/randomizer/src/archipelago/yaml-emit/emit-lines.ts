/* @layer shared-game @kind logic */
import { INDENT } from './yaml-emit.constants';
import { formatScalar } from './format-scalar';
import { formatString } from './format-string';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/** True for a value written on its own lines under its key, false for one written inline. */
const isBlock = (value: unknown): boolean =>
  (Array.isArray(value) && value.length > 0) || (isRecord(value) && Object.keys(value).length > 0);

const inlineEmpty = (value: unknown): string | null => {
  if (Array.isArray(value) && value.length === 0) return '[]';
  if (isRecord(value) && Object.keys(value).length === 0) return '{}';
  return null;
};

/** One array entry: "- scalar", or a block whose first line joins the dash. */
const emitItem = (item: unknown, depth: number): string[] => {
  const pad = INDENT.repeat(depth);
  if (!isBlock(item)) return [`${pad}- ${inlineEmpty(item) ?? formatScalar(item)}`];
  const [first, ...rest] = emitLines(item, depth + 1);
  return [`${pad}- ${(first ?? '').trimStart()}`, ...rest];
};

const emitLines = (value: unknown, depth: number): string[] => {
  const pad = INDENT.repeat(depth);
  if (Array.isArray(value)) return value.flatMap((item) => emitItem(item, depth));
  if (isRecord(value)) {
    return Object.entries(value).flatMap(([key, child]) => {
      if (isBlock(child)) return [`${pad}${formatString(key)}:`, ...emitLines(child, depth + 1)];
      return [`${pad}${formatString(key)}: ${inlineEmpty(child) ?? formatScalar(child)}`];
    });
  }
  return [`${pad}${formatScalar(value)}`];
};

export { emitLines };
