import { describe, it, expect } from 'vitest';
import { existsSync } from 'fs';
import { join } from 'path';
import { loadRom } from '../../shared/asset-extraction/rom';
import { getEntrances } from '../../shared/game/navigation/flood-fill/orchestrator';
import {
  ADDR_OW_ENTRANCE_AREA,
  ADDR_OW_ENTRANCE_POS,
  ADDR_OW_ENTRANCE_ID,
  ADDR_ENTRANCE_ROOM,
} from '../../shared/game/navigation/screen-data';

const ROM_PATH = join(__dirname, '..', '..', 'test-roms', 'Legend of Zelda, The - A Link to the Past (USA).sfc');
const romAvailable = existsSync(ROM_PATH);

describe.skipIf(!romAvailable)('Entrance area decoding', () => {
  it('matches word-indexed area table from ROM (uint16, stride 2) with big-screen adjustment', () => {
    const rom = loadRom(ROM_PATH);
    const entrances = getEntrances(rom);
    const ADDR_OW_MAP_IS_SMALL = 0x82f88d;

    expect(entrances).toHaveLength(148); // 129 door entrances + 19 fall holes

    for (let i = 0; i < 129; i++) {
      let expectedArea = rom.getWord(ADDR_OW_ENTRANCE_AREA + i * 2);
      const expectedPos = rom.getWord(ADDR_OW_ENTRANCE_POS + i * 2);
      const expectedId = rom.getByte(ADDR_OW_ENTRANCE_ID + i);
      const expectedRoomId = rom.getWord(ADDR_ENTRANCE_ROOM + expectedId * 2);

      // Apply big-screen sub-quadrant adjustment (same logic as orchestrator)
      const map16Row = expectedPos >> 7;
      const map16Col = (expectedPos & 0x7F) >> 1;
      if (expectedArea < 192 && rom.getByte(ADDR_OW_MAP_IS_SMALL + (expectedArea & 0x3F)) === 0) {
        if (map16Col >= 32) expectedArea += 1;
        if (map16Row >= 32) expectedArea += 8;
      }

      const got = entrances[i];
      expect(got.area).toBe(expectedArea);
      expect(got.pos).toBe(expectedPos);
      expect(got.id).toBe(expectedId);
      expect(got.roomId).toBe(expectedRoomId);
    }
  });
});
