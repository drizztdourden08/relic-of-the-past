import { describe, it, beforeAll, expect } from 'vitest';
import { existsSync } from 'fs';
import { join } from 'path';
import { loadRom, type RomData } from '../../shared/asset-extraction/rom';
import { floodFillScreen, getEntrances, initEngine } from '../../shared/game/navigation/flood-fill';

const ROM_PATH = join(__dirname, '..', '..', 'test-roms', 'Legend of Zelda, The - A Link to the Past (USA).sfc');
const romAvailable = existsSync(ROM_PATH);

describe.skipIf(!romAvailable)('Secret passage from Link position', () => {
  let rom: RomData;

  beforeAll(() => {
    rom = loadRom(ROM_PATH);
    initEngine(rom);
  });

  it('fall hole entrance for secret passage (room 0x55) is loaded on screen 0x1C', () => {
    const entrances = getEntrances(rom);
    const secretPassage = entrances.filter(e => e.roomId === 0x55 && e.area === 0x1C);
    console.log('Secret passage entries on 0x1C:', secretPassage);
    expect(secretPassage.length).toBe(2); // regular entrance + fall hole
    // Fall hole: entrance id=125, pos encodes (y-8)&0x3F, x is +1 from bush
    // actual row = 2+8=10 → grid(20, 46) after -1 col adjustment
    const fallHole = secretPassage.find(e => e.id === 125);
    expect(fallHole).toBeDefined();
    expect(fallHole!.gridRow).toBe(20);
    expect(fallHole!.gridCol).toBe(47);
  });

  it('BFS from grid (22,48) on 0x1C detects the secret passage entrance', () => {
    // Start BFS slightly south of entrance (simulating Link's position near the bush)
    const result = floodFillScreen(rom, 0x1C, new Set(['lift.1']), { row: 22, col: 48 });
    const found = result.entrances.find(e => e.roomId === 0x55);
    console.log('Entrances found:', result.entrances);
    expect(found).toBeDefined();
  });
});
