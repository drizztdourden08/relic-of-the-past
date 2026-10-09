/* @layer tests @kind test */
import { describe, it, expect } from 'vitest';
import {
  clampAxis,
  clampPosition,
  isValidForAxis,
  isWithinAxis,
} from '../../../apps/web/src/ui/design-system/primitives/PositionInput/behavior/clamp-axis';
import {
  SETTLED,
  displayValue,
  resolveTyped,
  settleDraft,
} from '../../../apps/web/src/ui/design-system/primitives/PositionInput/behavior/draft-rules';
import { GRID, OPEN, SIGNED } from './position-input.constants';

describe('bounds clamp each end of an axis', () => {
  it('leaves a value inside the range alone', () => {
    expect(clampAxis(12, GRID)).toBe(12);
    expect(clampAxis(0, GRID)).toBe(0);
    expect(clampAxis(63, GRID)).toBe(63);
  });

  it('pulls a value past the floor back to the floor', () => {
    expect(clampAxis(-1, GRID)).toBe(0);
    expect(clampAxis(-9999, GRID)).toBe(0);
    expect(clampAxis(-9, SIGNED)).toBe(-8);
  });

  it('pulls a value past the ceiling back to the ceiling', () => {
    expect(clampAxis(64, GRID)).toBe(63);
    expect(clampAxis(9999, GRID)).toBe(63);
    expect(clampAxis(9, SIGNED)).toBe(8);
  });

  it('leaves an open end open', () => {
    expect(clampAxis(-9999, { max: 10 })).toBe(-9999);
    expect(clampAxis(9999, { min: 0 })).toBe(9999);
    expect(clampAxis(9999, OPEN)).toBe(9999);
    expect(clampAxis(-9999, OPEN)).toBe(-9999);
  });

  it('trims the drift repeated stepping would accumulate', () => {
    expect(clampAxis(0.1 + 0.2, OPEN)).toBe(0.3);
  });

  it('answers the in-range question without changing anything', () => {
    expect(isWithinAxis(0, GRID)).toBe(true);
    expect(isWithinAxis(63, GRID)).toBe(true);
    expect(isWithinAxis(-1, GRID)).toBe(false);
    expect(isWithinAxis(64, GRID)).toBe(false);
    expect(isWithinAxis(-9999, OPEN)).toBe(true);
  });

  it('clamps the two axes independently of one another', () => {
    expect(clampPosition({ x: 99, y: -50 }, GRID, SIGNED)).toEqual({ x: 63, y: -8 });
    expect(clampPosition({ x: -5, y: 99 }, GRID, SIGNED)).toEqual({ x: 0, y: 8 });
    expect(clampPosition({ x: -5, y: -5 }, GRID, SIGNED)).toEqual({ x: 0, y: -5 });
    expect(clampPosition({ x: 99, y: 99 }, OPEN, GRID)).toEqual({ x: 99, y: 63 });
  });
});

describe('bounds let nothing but a number through', () => {
  it('never calls a non-number valid', () => {
    for (const bad of [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]) {
      expect(isValidForAxis(bad, GRID)).toBe(false);
      expect(isValidForAxis(bad, OPEN)).toBe(false);
    }
  });

  it('never calls an out-of-range number valid, at either end', () => {
    expect(isValidForAxis(-1, GRID)).toBe(false);
    expect(isValidForAxis(64, GRID)).toBe(false);
    expect(isValidForAxis(0, GRID)).toBe(true);
    expect(isValidForAxis(63, GRID)).toBe(true);
  });

  it('falls back to the last good value when asked to clamp a non-number', () => {
    expect(clampAxis(Number.NaN, GRID, 7)).toBe(7);
    expect(clampAxis(Number.NaN, GRID, 999)).toBe(63);
    expect(clampAxis(Number.NaN, GRID, Number.NaN)).toBe(0);
    expect(clampAxis(Number.NaN, SIGNED, Number.NaN)).toBe(-8);
    expect(clampAxis(Number.NaN, OPEN, Number.NaN)).toBe(0);
  });
});

describe('what typing a keystroke does', () => {
  it('sends a value that is already in range straight up', () => {
    expect(resolveTyped(5, GRID)).toEqual({ kind: 'emit', value: 5 });
    expect(resolveTyped(0, GRID)).toEqual({ kind: 'emit', value: 0 });
    expect(resolveTyped(63, GRID)).toEqual({ kind: 'emit', value: 63 });
  });

  it('holds a value past either bound instead of snapping mid-word', () => {
    expect(resolveTyped(64, GRID)).toEqual({ kind: 'hold', draft: 64 });
    expect(resolveTyped(-1, GRID)).toEqual({ kind: 'hold', draft: -1 });
  });

  it('holds a cleared or half-typed field', () => {
    expect(resolveTyped(Number.NaN, GRID).kind).toBe('hold');
    expect(resolveTyped(Number.NaN, OPEN).kind).toBe('hold');
  });
});

describe('what committing does when you leave the field', () => {
  it('does nothing at all when no edit was in flight', () => {
    expect(settleDraft(SETTLED, GRID, 3)).toBe(null);
  });

  it('clamps an out-of-range draft to the nearest bound', () => {
    expect(settleDraft(64, GRID, 3)).toBe(63);
    expect(settleDraft(-1, GRID, 3)).toBe(0);
    expect(settleDraft(-9, SIGNED, 0)).toBe(-8);
    expect(settleDraft(9, SIGNED, 0)).toBe(8);
  });

  it('keeps the last valid value when what was typed never became a number', () => {
    expect(settleDraft(Number.NaN, GRID, 3)).toBe(null);
  });

  it('passes an in-range draft through untouched', () => {
    expect(settleDraft(12, GRID, 3)).toBe(12);
  });
});

describe('what the field displays while it is being edited', () => {
  it('shows the committed value with no draft in flight', () => {
    expect(displayValue(SETTLED, 4)).toBe(4);
  });

  it('shows the draft while one is in flight, bound or no bound', () => {
    expect(displayValue(99, 4)).toBe(99);
    expect(displayValue(-1, 4)).toBe(-1);
  });

  it('shows nothing for a draft that is not a number, so half-typed text survives', () => {
    expect(displayValue(Number.NaN, 4)).toBe('');
  });

  it('shows nothing instead of NaN when the committed value itself is broken', () => {
    expect(displayValue(SETTLED, Number.NaN)).toBe('');
  });
});
