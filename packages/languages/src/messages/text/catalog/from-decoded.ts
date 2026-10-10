/* @layer shared-game @kind logic */
import type { DecodedLine, DecodedSlotOptions, TextSlot } from '../types';

const lastSegment = (key: string): string => {
  const parts = key.split(/[:/.]/).filter(Boolean);
  return parts.at(-1) ?? key;
};

const slotsFromDecoded = (lines: DecodedLine[], opts: DecodedSlotOptions = {}): TextSlot[] => {
  const { keyPrefix, note } = opts;
  return lines.map((line) => ({
    key: keyPrefix ? `${keyPrefix}${line.key}` : line.key,
    label: lastSegment(line.key),
    fallback: line.text,
    limit: line.limit,
    alphabet: 'pack' as const,
    ...(note ? { note } : {}),
  }));
};

export { slotsFromDecoded };
