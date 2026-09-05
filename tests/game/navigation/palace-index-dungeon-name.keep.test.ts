/* @layer tests @kind test */
/**
 * Pins `cur_palace_index_x2` → dungeon record → destination file stem.
 *
 * The values are the game's own, doubled (its tables index by
 * `cur_palace_index_x2 >> 1`). Ground truth: the ROM's dungeon-map floor-layout
 * table (SNES $8AF605, 14 entries), corroborated by `kDungeonCrystalPendantBit`.
 *
 * This drifted once: shifted by one dungeon from 0x08 up, which cost every
 * affected screen its exact `palace:room` key and left the palace-scan
 * fallback silently carrying nine dungeons. The editor picks the destination
 * FILE from `fileStem`, so a shifted table writes screens into the wrong file.
 *
 * The first castle has ONE dungeon record and two palace values; both resolve to it.
 */
import { describe, it, expect } from 'vitest';
import { getPalaceName, isDungeonPalace } from '../../../shared/game/logic/queries/dungeon-values';
import { dungeonForPalaceIndex } from '../../../shared/game/data/record-file-targets';
import { all } from '../../../shared/game/data';
import { describeDataset } from '../../dataset-guard';

/** palace value → dungeon file stem, straight off the ROM's floor-layout table. */
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
