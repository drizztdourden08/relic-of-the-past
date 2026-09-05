/* @layer tests @kind test */
/**
 * SegmentedControl's click decision as a plain function (no jsdom). The wiring
 * is covered at the SSR/props level in enum-kit-tiering.test.ts.
 */
import { describe, it, expect } from 'vitest';
import { resolveClick } from '../../apps/web/src/ui/design-system/primitives/SegmentedControl/behavior/resolve-click';

describe('what resolveClick makes of re-clicking a segment', () => {
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
