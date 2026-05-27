import { describe, it, beforeAll } from 'vitest';
import { existsSync } from 'fs';
import { join } from 'path';
import { loadRom, type RomData } from '../../shared/asset-extraction/rom';
import { floodFillScreen } from '../../shared/game/navigation/flood-fill';

const ROM_PATH = join(__dirname, '..', '..', 'test-roms', 'Legend of Zelda, The - A Link to the Past (USA).sfc');
const romAvailable = existsSync(ROM_PATH);

describe.skipIf(!romAvailable)('Expected desert→maze path borders', () => {
  let rom: RomData;

  beforeAll(() => {
    rom = loadRom(ROM_PATH);
  });

  it('checks border overlaps along expected path', () => {
    const inv = new Set(['lift.1', 'lift.2']);

    // User's expected path: 0x38 → 0x39 → 0x3A → (up) 0x32 → (west) 0x31 → (up) 0x29 → (west) 0x28
    // Or maybe: 0x38 → 0x39 → 0x3A → something → ... → 0x28
    // Let me check all relevant screens

    const screens = [0x38, 0x39, 0x3A, 0x3B, 0x30, 0x31, 0x32, 0x33, 0x29, 0x2A, 0x28, 0x20, 0x21];
    const borders = new Map<number, { n: number[]; s: number[]; e: number[]; w: number[] }>();

    for (const s of screens) {
      const result = floodFillScreen(rom, s, inv);
      const n: number[] = [], south: number[] = [], e: number[] = [], w: number[] = [];
      for (let i = 0; i < 64; i++) {
        if (result.reachable[0]?.[i]) n.push(i);
        if (result.reachable[63]?.[i]) south.push(i);
        if (result.reachable[i]?.[63]) e.push(i);
        if (result.reachable[i]?.[0]) w.push(i);
      }
      borders.set(s, { n, s: south, e, w });
    }

    console.log('=== Border reachability per screen ===');
    for (const s of screens) {
      const b = borders.get(s)!;
      console.log(`  0x${s.toString(16).padStart(2, '0')}: N=${b.n.length} S=${b.s.length} E=${b.e.length} W=${b.w.length}`);
    }

    // Check valid connections (both sides must have matching border tiles)
    console.log('\n=== Connection validity (overlap check) ===');
    const checkConnection = (from: number, to: number, dir: 'north' | 'south' | 'east' | 'west') => {
      const fromB = borders.get(from)!;
      const toB = borders.get(to)!;
      let fromTiles: number[], toTiles: number[];
      switch (dir) {
        case 'east':  fromTiles = fromB.e; toTiles = toB.w; break;
        case 'west':  fromTiles = fromB.w; toTiles = toB.e; break;
        case 'north': fromTiles = fromB.n; toTiles = toB.s; break;
        case 'south': fromTiles = fromB.s; toTiles = toB.n; break;
      }
      const overlap = fromTiles.filter(t => toTiles.includes(t));
      const valid = overlap.length > 0;
      console.log(`  0x${from.toString(16)} → 0x${to.toString(16)} (${dir}): from=${fromTiles.length} to=${toTiles.length} overlap=${overlap.length} ${valid ? '✓' : '✗'}`);
      return valid;
    };

    // Check the path the screen-hop found (invalid?)
    console.log('\n--- Screen-hop path (current, probably invalid) ---');
    checkConnection(0x38, 0x30, 'north');
    checkConnection(0x30, 0x31, 'east');
    checkConnection(0x31, 0x29, 'north'); // This should be INVALID
    checkConnection(0x29, 0x28, 'west');

    // Check user's expected path variants
    console.log('\n--- User expected path checks ---');
    checkConnection(0x38, 0x39, 'east');   // Desert SW → Desert SE
    checkConnection(0x39, 0x3A, 'east');   // Desert SE → Via of Mystery
    checkConnection(0x3A, 0x32, 'north');  // Via of Mystery → Haunted Terrace (up)
    checkConnection(0x32, 0x31, 'west');   // Haunted Terrace → Desert NE (left)
    checkConnection(0x32, 0x2A, 'north');  // Haunted Terrace → Haunted Grove (up)
    checkConnection(0x2A, 0x29, 'west');   // Haunted Grove → Kakariko S Annex? No...
    checkConnection(0x29, 0x28, 'west');   // Kakariko S Annex → Maze (west)

    // Other potential paths
    console.log('\n--- Additional adjacency checks ---');
    checkConnection(0x3A, 0x3B, 'east');   // Via of Mystery → east neighbor
    checkConnection(0x3B, 0x33, 'north');  // → up
    checkConnection(0x32, 0x33, 'east');   // Haunted Terrace → east
    checkConnection(0x31, 0x32, 'east');   // Desert NE → Haunted Terrace
    checkConnection(0x20, 0x28, 'south');  // Kakariko SW → Maze
    checkConnection(0x20, 0x29, 'east');   // Kakariko SW → S Annex? No, not adjacent
    checkConnection(0x21, 0x29, 'south');  // Kakariko SE → S Annex
    checkConnection(0x20, 0x21, 'east');   // Kakariko SW → SE
  });
});
