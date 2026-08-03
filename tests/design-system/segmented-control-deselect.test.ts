/* @layer tests @kind test */
/**
 * SegmentedControl's click decision, tested where it lives: as a plain
 * function. There is no jsdom or testing-library in this repo, so an actual
 * click cannot be dispatched at a button — this covers the one branch a
 * click resolves through, and the wiring is the one line a browser would
 * have to confirm (see enum-kit-tiering.test.ts for that wiring, tested at
 * the SSR/props level).
 */
import { describe, it, expect } from 'vitest';
import { resolveClick } from '../../apps/web/src/ui/design-system/primitives/SegmentedControl/behavior/resolve-click';

describe('resolveClick — what re-clicking a segment resolves to', () => {
  it('deselects only when the active segment is clicked again and a handler was wired', () => {
    expect(resolveClick('a', 'a', true)).toEqual({ kind: 'deselect' });
  });

  it('is a no-op change back to the same value on a required field (no handler wired)', () => {
    expect(resolveClick('a', 'a', false)).toEqual({ kind: 'change', value: 'a' });
  });

  it('always changes to a different segment, whether or not deselect is wired', () => {
    expect(resolveClick('b', 'a', true)).toEqual({ kind: 'change', value: 'b' });
    expect(resolveClick('b', 'a', false)).toEqual({ kind: 'change', value: 'b' });
  });
});
