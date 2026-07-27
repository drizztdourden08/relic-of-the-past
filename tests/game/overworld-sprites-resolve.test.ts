/* @layer tests @kind test */
import { describe, it, expect, vi } from 'vitest';

// getOverworldSprites reads two bridge queries directly — the spawn table and
// the area-head table — so both are mocked here rather than running the game.
vi.mock('@app/lib/game', () => ({
  wasmGetOverworldSpriteSpawns: vi.fn(),
  wasmGetAreaHeads: vi.fn(),
  wasmGetRoomChests: vi.fn(),
  wasmGetRoomSpriteSpawns: vi.fn(),
  wasmGetRoomDoorInfo: vi.fn(),
  wasmGetRoomCellLocks: vi.fn(),
}));

import { wasmGetOverworldSpriteSpawns, wasmGetAreaHeads } from '@app/lib/game';
import { getOverworldSprites } from '@app/lib/game/simulator/interactables';

const HEAD = 24;
const heads = (() => {
  const table = new Uint8Array(64);
  for (let i = 0; i < 64; i++) table[i] = i;
  table[24] = HEAD;
  table[25] = HEAD;
  table[32] = HEAD;
  table[33] = HEAD;
  return table;
})();

describe('getOverworldSprites — resolves spawns to their true screen', () => {
  it('emits a far-half spawn already resolved to its true screen and local tile', () => {
    vi.mocked(wasmGetAreaHeads).mockReturnValue(heads);
    vi.mocked(wasmGetOverworldSpriteSpawns).mockReturnValue([
      { spriteType: 0xeb, row: 84, col: 12, carriesKey: false, carriesBigKey: false, floor: 0 },
    ]);

    expect(getOverworldSprites(HEAD)).toEqual([
      {
        roomId: HEAD + 8,
        outdoor: true,
        spriteType: 0xeb,
        tile: { row: 20, col: 12 },
        posKnown: true,
        kind: 'standing',
        itemId: 0x17,
      },
    ]);
  });

  it('leaves an in-range spawn on the queried screen when the area-head table is unavailable', () => {
    vi.mocked(wasmGetAreaHeads).mockReturnValue(null);
    vi.mocked(wasmGetOverworldSpriteSpawns).mockReturnValue([
      { spriteType: 0xeb, row: 5, col: 5, carriesKey: false, carriesBigKey: false, floor: 0 },
    ]);

    const [sprite] = getOverworldSprites(HEAD);
    expect(sprite.roomId).toBe(HEAD);
    expect(sprite.tile).toEqual({ row: 5, col: 5 });
  });
});
