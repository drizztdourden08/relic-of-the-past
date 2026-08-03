/* @layer test @kind test */
/** Importing the shared detectors barrel installs every one as a side effect. */
import { describe, it, expect } from 'vitest';
import { detectorsFor } from '@shared/game/recommendations';
import '@shared/game/recommendations/detectors';

describe('the shared recommendations detector barrel', () => {
  it('installs a detector for each kind it covers', () => {
    expect(detectorsFor('actor').map(d => d.id).sort()).toEqual(['actor-combat', 'actor-spawns']);
    expect(detectorsFor('check').map(d => d.id)).toEqual(['check-presence']);
    expect(detectorsFor('dungeon').map(d => d.id)).toEqual(['dungeon-rooms']);
    expect(detectorsFor('item').map(d => d.id)).toEqual(['item-grants']);
  });
});
