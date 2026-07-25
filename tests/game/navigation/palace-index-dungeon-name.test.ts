/* @layer tests @kind test */
/**
 * Pins `cur_palace_index_x2` → dungeon name, the mapping every dungeon screen is
 * keyed by.
 *
 * The values are the game's own, doubled: its dungeon tables are indexed by
 * `cur_palace_index_x2 >> 1`. The ground truth here is the ROM's dungeon-map
 * floor-layout table (pointers at SNES $8AF605 — 14 entries, one per dungeon, each
 * listing that dungeon's room numbers), corroborated by `kDungeonCrystalPendantBit`.
 *
 * This mapping drifted once already: it had been shifted by one dungeon from 0x08
 * up, which cost every affected screen its exact `palace:room` key and left the
 * room-only palace-scan fallback quietly carrying nine dungeons. Worse, screen
 * codegen picks the destination FILE from `getDungeonName`, so a shifted table
 * writes screens into the wrong dungeon file. Pinning all 13 values keeps the data
 * and the name table in lockstep.
 */
import { describe, it, expect } from 'vitest';
import {
  getDungeonName,
  getPalaceName,
  DUNGEON_PALACE_VALUES,
  DUNGEON_META,
} from '../../../shared/game/data/screens/game-values';

/** palace value → dungeon name, straight off the ROM's floor-layout table. */
const EXPECTED: ReadonlyArray<readonly [number, string]> = [
  [0x00, 'Hyrule Castle'],
  [0x02, 'Hyrule Castle'],
  [0x04, 'Eastern Palace'],
  [0x06, 'Desert Palace'],
  [0x08, 'Castle Tower'],
  [0x0A, 'Swamp Palace'],
  [0x0C, 'Palace of Darkness'],
  [0x0E, 'Misery Mire'],
  [0x10, 'Skull Woods'],
  [0x12, 'Ice Palace'],
  [0x14, 'Tower of Hera'],
  [0x16, "Thieves' Town"],
  [0x18, 'Turtle Rock'],
  [0x1A, "Ganon's Tower"],
];

const hex = (n: number): string => `0x${n.toString(16).toUpperCase().padStart(2, '0')}`;

describe('palace index → dungeon name', () => {
  for (const [palace, name] of EXPECTED) {
    it(`resolves ${hex(palace)} to ${name}`, () => {
      expect(getDungeonName(palace)).toBe(name);
    });
  }

  it('covers exactly the 14 dungeon palace values and nothing else', () => {
    const declared = Object.values(DUNGEON_PALACE_VALUES).flat().sort((a, b) => a - b);
    expect(declared).toEqual(EXPECTED.map(([palace]) => palace));
  });

  it('names every dungeon in the reverse table, with no orphan names', () => {
    const names = new Set(EXPECTED.map(([, name]) => name));
    expect(new Set(Object.keys(DUNGEON_PALACE_VALUES))).toEqual(names);
    expect(new Set(Object.keys(DUNGEON_META))).toEqual(names);
  });

  it('leaves cave/house rooms out of the dungeon mapping', () => {
    expect(getPalaceName(0xFF)).toBe('Cave / House');
    expect(getDungeonName(0xFF)).toMatch(/^Unknown Dungeon/);
  });
});
