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
  it('matches byte-indexed area table from ROM', () => {
    const rom = loadRom(ROM_PATH);
    const entrances = getEntrances(rom);

    expect(entrances).toHaveLength(129);

    for (let i = 0; i < 129; i++) {
      const expectedArea = rom.getByte(ADDR_OW_ENTRANCE_AREA + i);
      const expectedPos = rom.getWord(ADDR_OW_ENTRANCE_POS + i * 2);
      const expectedId = rom.getByte(ADDR_OW_ENTRANCE_ID + i);
      const expectedRoomId = rom.getWord(ADDR_ENTRANCE_ROOM + expectedId * 2);

      const got = entrances[i];
      expect(got.area).toBe(expectedArea);
      expect(got.pos).toBe(expectedPos);
      expect(got.id).toBe(expectedId);
      expect(got.roomId).toBe(expectedRoomId);
    }
  });
});
