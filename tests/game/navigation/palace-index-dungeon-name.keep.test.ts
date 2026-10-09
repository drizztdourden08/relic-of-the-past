/* @layer tests @kind test */
import { describe, it, expect } from 'vitest';
import { getPalaceName, isDungeonPalace, dungeonForPalaceIndex, all } from '@rotp/game-data';
import { describeDataset } from '../../dataset-guard';

const EXPECTED: ReadonlyArray<readonly [number, string]> = [
  [0x00, 'hyrule-castle'],
  [0x02, 'hyrule-castle'],
  [0x04, 'eastern-palace'],
  [0x06, 'desert-palace'],
  [0x08, 'castle-tower'],
  [0x0A, 'swamp-palace'],
  [0x0C, 'palace-of-darkness'],
  [0x0E, 'misery-mire'],
  [0x10, 'skull-woods'],
  [0x12, 'ice-palace'],
  [0x14, 'tower-of-hera'],
  [0x16, 'thieves-town'],
  [0x18, 'turtle-rock'],
  [0x1A, 'ganons-tower'],
];

const hex = (n: number): string => `0x${n.toString(16).toUpperCase().padStart(2, '0')}`;

describeDataset('palace index → dungeon record', () => {
  for (const [palace, fileStem] of EXPECTED) {
    it(`resolves ${hex(palace)} to ${fileStem}`, () => {
      expect(dungeonForPalaceIndex(palace)?.fileStem).toBe(fileStem);
    });
  }

  it('covers exactly the 14 dungeon palace values and nothing else', () => {
    const resolvable = Array.from({ length: 0x100 }, (_, i) => i)
      .filter(i => dungeonForPalaceIndex(i) !== undefined);
    expect(resolvable).toEqual(EXPECTED.map(([palace]) => palace));
  });

  it('gives every dungeon record a unique file stem, with no orphans', () => {
    const stems = all('dungeon').map(d => d.fileStem);
    expect(new Set(stems).size).toBe(stems.length);
    expect(new Set(stems)).toEqual(new Set(EXPECTED.map(([, stem]) => stem)));
  });

  it('leaves cave/house rooms out of the dungeon mapping', () => {
    expect(getPalaceName(0xFF)).toBe('Cave / House');
    expect(isDungeonPalace(0xFF)).toBe(false);
    expect(dungeonForPalaceIndex(0xFF)).toBeUndefined();
  });
});
