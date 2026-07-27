/* @layer test @kind test */
import { describe, it, expect } from 'vitest';
import { rankEntries } from '@app/ui/domains/app/views/SearchPalette/behavior/match';
import type { SearchEntry } from '@app/ui/domains/app/views/SearchPalette/SearchPalette.type';

const entry = (partial: Partial<SearchEntry> & Pick<SearchEntry, 'id' | 'kind' | 'label'>): SearchEntry => ({
  breadcrumb: [],
  ...partial,
});

describe('rankEntries', () => {
  it('returns nothing for an empty or whitespace query', () => {
    const entries = [entry({ id: '1', kind: 'setting', label: 'Anything' })];
    expect(rankEntries(entries, '')).toEqual([]);
    expect(rankEntries(entries, '   ')).toEqual([]);
  });

  it('requires every query token to match somewhere (AND, not OR)', () => {
    const entries = [
      entry({ id: 'both', kind: 'setting', label: 'Pixel Perfect', keywords: 'sharp crisp' }),
      entry({ id: 'one', kind: 'setting', label: 'Pixel Art', keywords: 'retro' }),
    ];
    const results = rankEntries(entries, 'pixel crisp');
    expect(results.map((e) => e.id)).toEqual(['both']);
  });

  it('ranks an exact label match above a mere substring hit', () => {
    const entries = [
      entry({ id: 'substring', kind: 'setting', label: 'Enable Haptic Feedback', description: 'mentions audio in passing' }),
      entry({ id: 'exact', kind: 'setting', label: 'Audio' }),
    ];
    const results = rankEntries(entries, 'audio');
    expect(results[0].id).toBe('exact');
  });

  it('boosts screens/tabs above a setting that only mentions the term in passing', () => {
    const entries = [
      entry({ id: 'setting', kind: 'setting', label: 'Extra Data Column', description: 'shows extra data in the HUD' }),
      entry({ id: 'screen', kind: 'screen', label: 'Data Manager', keywords: 'data manager profiles roms' }),
    ];
    const results = rankEntries(entries, 'data');
    expect(results[0].id).toBe('screen');
  });

  it('the "sprite" query surfaces a setting, a screen, and an action together', () => {
    const entries = [
      entry({
        id: 'setting:linkSprite', kind: 'setting', label: 'Player Sprite',
        breadcrumb: ['Home', 'Graphics', 'Appearance'],
        keywords: 'player sprite character appearance custom zspr',
      }),
      entry({
        id: 'menu:sprites', kind: 'screen', label: 'Sprites',
        breadcrumb: ['Data'], keywords: 'Data Sprites',
      }),
      entry({
        id: 'action:add-sprite-pack', kind: 'action', label: 'Add sprite pack',
        breadcrumb: ['Data Manager', 'Sprites'], keywords: 'add sprite pack import file',
      }),
      entry({
        id: 'action:import-rom', kind: 'action', label: 'Add a ROM',
        breadcrumb: ['Data Manager', 'ROMs'], keywords: 'add import rom file game',
      }),
    ];
    const results = rankEntries(entries, 'sprite');
    const ids = results.map((e) => e.id);
    expect(ids).toContain('setting:linkSprite');
    expect(ids).toContain('menu:sprites');
    expect(ids).toContain('action:add-sprite-pack');
    expect(ids).not.toContain('action:import-rom');
  });

  it('breaks ties on shorter label when scores are equal', () => {
    const entries = [
      entry({ id: 'long', kind: 'setting', label: 'Gold Standard Settings Panel' }),
      entry({ id: 'short', kind: 'setting', label: 'Gold' }),
    ];
    const results = rankEntries(entries, 'gold');
    expect(results[0].id).toBe('short');
  });
});
