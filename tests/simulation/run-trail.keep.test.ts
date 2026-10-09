/* @layer tests @kind test */
import { describe, it, expect } from 'vitest';
import type { TrailStop } from '../../apps/desktop/src/stores/simulator-store';
import { haulAt } from '../../apps/desktop/src/ui/domains/widgets/simulator/sub-components/trail-haul';

const stop = (screenId: string, checksAt: number): TrailStop => ({ screenId, epoch: 0, checksAt });

describe('run trail haul', () => {
  const trail = [stop('ow:44', 0), stop('room:260', 1), stop('room:128', 1), stop('room:18', 4)];

  it('credits a stop with the checks earned before leaving it', () => {
    expect(haulAt(trail, 0, 4)).toBe(1);
    expect(haulAt(trail, 1, 4)).toBe(0);
    expect(haulAt(trail, 2, 4)).toBe(3);
  });

  it('closes the last stop against the live tally', () => {
    expect(haulAt(trail, 3, 4)).toBe(0);
    expect(haulAt(trail, 3, 7)).toBe(3);
  });

  it('never reports a negative haul when the tally is stale', () => {
    expect(haulAt(trail, 3, 0)).toBe(0);
  });
});
