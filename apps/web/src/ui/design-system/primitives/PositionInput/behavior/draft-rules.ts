/* @layer renderer-components @kind logic */
/**
 * The edit-in-flight rules, kept as pure functions so the hook around them holds
 * state and nothing else.
 *
 * Two decisions make up the whole behaviour. A keystroke is either already good
 * enough to send up or it is held back as a draft; a draft, once the field is
 * left, is either clamped into range or thrown away in favour of the last value
 * that was valid. Between them they are what guarantees the caller's onChange
 * never sees NaN and never sees a value outside its own bounds.
 */
import { clampAxis, isValidForAxis } from './clamp-axis';
import type { PositionAxis } from '../PositionInput.type';

/** No edit in flight, so the field shows the committed value. */
const SETTLED = null;

type TypedOutcome =
  /** Valid as typed: hand it to the caller now, so the common case stays live. */
  | { kind: 'emit'; value: number }
  /** Empty, half-typed or past a bound: keep it on screen, tell the caller nothing. */
  | { kind: 'hold'; draft: number };

const resolveTyped = (typed: number, axis: PositionAxis = {}): TypedOutcome =>
  isValidForAxis(typed, axis) ? { kind: 'emit', value: typed } : { kind: 'hold', draft: typed };

/**
 * What leaving the field does with a draft. Null means there is nothing to send:
 * either no edit was in flight, or what was typed never became a number and the
 * last valid value stands.
 */
const settleDraft = (draft: number | null, axis: PositionAxis = {}, last = 0): number | null => {
  if (draft === SETTLED || !Number.isFinite(draft)) return null;
  return clampAxis(draft, axis, last);
};

/**
 * What the field shows. A draft that is not a number renders empty, which also
 * keeps a half-typed entry visible: a number field reads back "" for text it
 * cannot parse, so React sees no change and leaves what was typed alone.
 */
const displayValue = (draft: number | null, value: number): number | '' => {
  const shown = draft === SETTLED ? value : draft;
  return Number.isFinite(shown) ? shown : '';
};

export { SETTLED, displayValue, resolveTyped, settleDraft };
export type { TypedOutcome };
