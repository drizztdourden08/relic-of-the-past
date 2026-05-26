import { describe, it, beforeAll } from 'vitest';
import { existsSync } from 'fs';
import { join } from 'path';
import { loadRom, type RomData } from '../../shared/asset-extraction/rom';
import {
  ADDR_OW_ENTRANCE_AREA,
  ADDR_OW_ENTRANCE_POS,
  ADDR_OW_ENTRANCE_ID,
  ADDR_ENTRANCE_ROOM,
} from '../../shared/game/navigation/screen-data';

const ROM_PATH = join(__dirname, '..', '..', 'test-roms', 'Legend of Zelda, The - A Link to the Past (USA).sfc');
const romAvailable = existsSync(ROM_PATH);

describe.skipIf(!romAvailable)('Entrance Table Decoder Diagnostic', () => {
  let rom: RomData;

  beforeAll(() => {
    rom = loadRom(ROM_PATH);
  });

  it('compares area as word vs byte decoding', () => {
    const targetScreens = new Set([0x1b, 0x23, 0x24]);

    const wordDecoded: Array<{ i: number; area: number; pos: number; id: number; roomId: number; gridRow: number; gridCol: number }> = [];
    const byteDecoded: Array<{ i: number; area: number; pos: number; id: number; roomId: number; gridRow: number; gridCol: number }> = [];

    for (let i = 0; i < 129; i++) {
      const areaWord = rom.getWord(ADDR_OW_ENTRANCE_AREA + i * 2);
      const areaByte = rom.getByte(ADDR_OW_ENTRANCE_AREA + i);
      const pos = rom.getWord(ADDR_OW_ENTRANCE_POS + i * 2);
      const id = rom.getByte(ADDR_OW_ENTRANCE_ID + i);
      const roomId = rom.getWord(ADDR_ENTRANCE_ROOM + id * 2);

      const map16Row = pos >> 7;
      const map16Col = (pos & 0x7f) >> 1;
      const gridRow = (map16Row % 32) * 2;
      const gridCol = (map16Col % 32) * 2;

      wordDecoded.push({ i, area: areaWord, pos, id, roomId, gridRow, gridCol });
      byteDecoded.push({ i, area: areaByte, pos, id, roomId, gridRow, gridCol });
    }

    const wordForTargets = wordDecoded.filter(e => targetScreens.has(e.area));
    const byteForTargets = byteDecoded.filter(e => targetScreens.has(e.area));

    console.log('\n=== Entrance decode comparison ===');
    console.log(`word-decoded areas in [0x1B,0x23,0x24]: ${wordForTargets.length}`);
    console.log(`byte-decoded areas in [0x1B,0x23,0x24]: ${byteForTargets.length}`);

    console.log('\n--- Word-decoded entries for target screens ---');
    for (const e of wordForTargets) {
      console.log(`#${e.i} area=0x${e.area.toString(16)} room=0x${e.roomId.toString(16)} pos=0x${e.pos.toString(16)} grid=(${e.gridRow},${e.gridCol}) id=${e.id}`);
    }

    console.log('\n--- Byte-decoded entries for target screens ---');
    for (const e of byteForTargets) {
      console.log(`#${e.i} area=0x${e.area.toString(16)} room=0x${e.roomId.toString(16)} pos=0x${e.pos.toString(16)} grid=(${e.gridRow},${e.gridCol}) id=${e.id}`);
    }

    const wordAreaRange = {
      min: Math.min(...wordDecoded.map(e => e.area)),
      max: Math.max(...wordDecoded.map(e => e.area)),
    };
    const byteAreaRange = {
      min: Math.min(...byteDecoded.map(e => e.area)),
      max: Math.max(...byteDecoded.map(e => e.area)),
    };

    console.log('\nArea ranges:');
    console.log(`word: min=0x${wordAreaRange.min.toString(16)} max=0x${wordAreaRange.max.toString(16)}`);
    console.log(`byte: min=0x${byteAreaRange.min.toString(16)} max=0x${byteAreaRange.max.toString(16)}`);
  });
});
