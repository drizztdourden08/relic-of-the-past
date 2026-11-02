/* @layer renderer-app @kind logic */
import { PRESS_FRAMES } from './input-script.constants';
import { buttonBit } from './button-bit';
import type { ButtonKey, EventParse } from './parse-event.type';

const fail = (error: string): EventParse => ({ ok: false, error });

const wholeNumber = (value: unknown): value is number => typeof value === 'number' && Number.isInteger(value) && value >= 0;

const maskOf = (names: unknown): number | string => {
  if (!Array.isArray(names) || names.length === 0) return 'needs a non-empty list of buttons';
  let mask = 0;
  for (const name of names) {
    const bit = typeof name === 'string' ? buttonBit(name) : null;
    if (bit === null) return `"${String(name)}" is not a pad button`;
    mask |= bit;
  }
  return mask;
};

const buttonKeyOf = (entry: Record<string, unknown>): ButtonKey | null => {
  if ('press' in entry) return 'press';
  if ('hold' in entry) return 'hold';
  return null;
};

const defaultLengthOf = (key: ButtonKey): number | undefined => (key === 'press' ? PRESS_FRAMES : undefined);

const parseEvent = (raw: unknown, index: number): EventParse => {
  const at = `event ${index}`;
  if (typeof raw !== 'object' || raw === null) return fail(`${at} is not an object`);
  const entry = raw as Record<string, unknown>;
  if (!wholeNumber(entry.frame)) return fail(`${at} needs a whole "frame" of 0 or more`);
  const key = buttonKeyOf(entry);
  if (key === null) return fail(`${at} needs "press" or "hold"`);
  const mask = maskOf(entry[key]);
  if (typeof mask === 'string') return fail(`${at} "${key}" ${mask}`);
  const length = entry.for ?? defaultLengthOf(key);
  if (!wholeNumber(length) || length < 1) return fail(`${at} needs "for", a whole number of frames of 1 or more`);
  return { ok: true, event: { start: entry.frame, end: entry.frame + length, mask } };
};

export { parseEvent };
