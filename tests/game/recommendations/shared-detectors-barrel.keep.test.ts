/* @layer test @kind test */
import { describe, it, expect } from 'vitest';
import { detectorsFor } from '@rotp/navigation';
import '@rotp/navigation';
import '@rotp/navigation';
import '@rotp/navigation';
import '@rotp/navigation';
import '@rotp/navigation';

describe('the strategy barrels phase 5 replaced the shared detectors barrel with', () => {
  it('installs one strategy-backed detector for each kind it covers', () => {
    expect(detectorsFor('actor').map(d => d.id)).toEqual(['strategy:actor']);
    expect(detectorsFor('check').map(d => d.id)).toEqual(['strategy:check']);
    expect(detectorsFor('dungeon').map(d => d.id)).toEqual(['strategy:dungeon']);
    expect(detectorsFor('item').map(d => d.id)).toEqual(['strategy:item']);
  });
});
