/* @layer tests @kind test */
/**
 * Tag inference for a real crossing the dataset does not map. Used to test
 * `connection-audit-resolve.ts`'s `inferTagsForDetected` (removed in phase 4,
 * part 2); its replacement, `points.set.ts`'s `inferTags`, does the same job
 * over an `ObservedTransition`'s `source`. Updated, not deleted, since the
 * behaviour is unchanged.
 */
import { describe, it, expect } from 'vitest';
import type { ObservedTransition } from '@shared/game/recommendations';
import { inferTags } from '../../../apps/web/src/ui/domains/widgets/navigation/recommendations/strategies/connection/points.set';

const transitionOf = (source: string): ObservedTransition => ({ source, kind: 'room', index: 0x55 });

describe('inferTags on a detected-but-unmapped transition', () => {
  it('tags an exit (the overworld screen a room exits to) as a door', () => {
    expect(inferTags(transitionOf('exit'))).toEqual(['transit:door', 'ctx:entrance']);
  });

  it('tags an entrance (an overworld door into a room) as a door', () => {
    expect(inferTags(transitionOf('entrance'))).toEqual(['transit:door', 'ctx:entrance']);
  });

  it('tags a stair as internal stairs', () => {
    expect(inferTags(transitionOf('stair'))).toEqual(['transit:stairs', 'ctx:internal']);
  });

  it('tags a fall hole as an entrance drop', () => {
    expect(inferTags(transitionOf('hole'))).toEqual(['transit:hole', 'ctx:entrance']);
  });

  it('tags a travel destination as an internal walk', () => {
    expect(inferTags(transitionOf('travel'))).toEqual(['transit:walk', 'ctx:internal']);
  });
});
