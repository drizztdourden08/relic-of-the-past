/* @layer renderer-app @kind logic */
import { PRESS_FRAMES } from './input-script.constants';
import { buttonBit } from './button-bit';

interface ScriptEvent {
  start: number;
  end: number;
  mask: number;
}

type EventParse = { ok: true; event: ScriptEvent } | { ok: false; error: string };

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

const parseEvent = (raw: unknown, index: number): EventParse => {
  const at = `event ${index}`;
  if (typeof raw !== 'object' || raw === null) return { ok: false, error: `${at} is not an object` };
  const entry = raw as Record<string, unknown>;
  if (!wholeNumber(entry.frame)) return { ok: false, error: `${at} needs a whole "frame" of 0 or more` };
  const key = 'press' in entry ? 'press' : 'hold' in entry ? 'hold' : null;
  if (key === null) return { ok: false, error: `${at} needs "press" or "hold"` };
  const mask = maskOf(entry[key]);
  if (typeof mask === 'string') return { ok: false, error: `${at} "${key}" ${mask}` };
  const length = entry.for ?? (key === 'press' ? PRESS_FRAMES : undefined);
  if (!wholeNumber(length) || length < 1) return { ok: false, error: `${at} needs "for", a whole number of frames of 1 or more` };
  return { ok: true, event: { start: entry.frame, end: entry.frame + length, mask } };
};

export { parseEvent };
export type { ScriptEvent };
