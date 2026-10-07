/* @layer test @kind test */
/**
 * The shared `detectors/` barrel was deleted in phase 5; every kind (`actor`,
 * `check`, `dungeon`, `item`) is a comparison strategy now. Importing each
 * strategy's barrel, then `strategy-detectors`, installs a `strategy:<kind>`
 * detector per kind.
 */
import { describe, it, expect } from 'vitest';
import { detectorsFor } from '@shared/game/recommendations';
import '@shared/game/recommendations/strategies/actor';
import '@shared/game/recommendations/strategies/check';
import '@shared/game/recommendations/strategies/dungeon';
import '@shared/game/recommendations/strategies/item';
import '@shared/game/recommendations/strategy-detectors';

describe('the strategy barrels phase 5 replaced the shared detectors barrel with', () => {
  it('installs one strategy-backed detector for each kind it covers', () => {
    expect(detectorsFor('actor').map(d => d.id)).toEqual(['strategy:actor']);
    expect(detectorsFor('check').map(d => d.id)).toEqual(['strategy:check']);
    expect(detectorsFor('dungeon').map(d => d.id)).toEqual(['strategy:dungeon']);
    expect(detectorsFor('item').map(d => d.id)).toEqual(['strategy:item']);
  });
});
