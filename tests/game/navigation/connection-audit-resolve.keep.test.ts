/* @layer tests @kind test */
import { describe, it, expect } from 'vitest';
import type { ObservedTransition } from '@rotp/game-core';
import { inferTags } from '@app/views/NavigationWidget/recommendations/strategies/connection/points.set';

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

  it('tags a travel destination as an internal warp', () => {
    expect(inferTags(transitionOf('travel'))).toEqual(['transit:warp', 'ctx:internal']);
  });
});
