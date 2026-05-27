import { describe, it, beforeAll } from 'vitest';
import { existsSync } from 'fs';
import { join } from 'path';
import { loadRom, type RomData } from '../../shared/asset-extraction/rom';
import { floodFillScreen, getEntrances } from '../../shared/game/navigation/flood-fill';

const ROM_PATH = join(__dirname, '..', '..', 'test-roms', 'Legend of Zelda, The - A Link to the Past (USA).sfc');
const romAvailable = existsSync(ROM_PATH);

describe.skipIf(!romAvailable)('Entrance tile attrs diagnostic', () => {
  let rom: RomData;

  beforeAll(() => {
    rom = loadRom(ROM_PATH);
  });

  it('dumps entrances for screens 0x2B, 0x2C, 0x1B with tile attrs', () => {
    const entrances = getEntrances(rom);
    const screens = [0x2B, 0x2C, 0x1B, 0x1C];
    const screenNames: Record<number, string> = {
      0x2B: "Uncle's Estate West",
      0x2C: "Uncle's Estate East (Link's house)",
      0x1B: "Hyrule Castle NW",
      0x1C: "Hyrule Castle NE",
    };

    for (const screenIndex of screens) {
      const screenEnts = entrances.filter(e => e.area === screenIndex);
      console.log(`\n=== Screen 0x${screenIndex.toString(16)} (${screenNames[screenIndex]}) — ${screenEnts.length} entrances ===`);

      if (screenEnts.length === 0) continue;

      // Run flood fill from center
      const result = floodFillScreen(rom, screenIndex, new Set(['lift.1', 'lift.2']), { row: 32, col: 32 });
      console.log(`  BFS from center: ${result.reachableCount}/${result.totalTiles} tiles reached`);
      console.log(`  BFS detected ${result.transitions.filter(t => t.edge === 'entrance').length} entrance transitions`);

      for (const ent of screenEnts) {
        const triggers = [
          [ent.gridRow, ent.gridCol],
          [ent.gridRow, ent.gridCol + 1],
          [ent.gridRow + 1, ent.gridCol],
          [ent.gridRow + 1, ent.gridCol + 1],
        ];
        const triggerInfo = triggers.map(([r, c]) => {
          if (r < 0 || r >= 64 || c < 0 || c >= 64) return `(${r},${c}) OOB`;
          const attr = result.attrGrid![r][c];
          const reached = result.reachable[r][c];
          return `(${r},${c}) attr=0x${attr.toString(16)} reached=${reached}`;
        });
        const detected = result.transitions.some(t => t.edge === 'entrance' && t.entranceIdx === ent.id);
        console.log(`  Entrance slot=${entrances.indexOf(ent)} id=${ent.id} room=0x${ent.roomId.toString(16)} grid=(${ent.gridRow},${ent.gridCol}) pos=0x${ent.pos.toString(16)} DETECTED=${detected}`);
        console.log(`    triggers: ${triggerInfo.join(' | ')}`);

        // Dump the adjacency ring
        const adjTiles: string[] = [];
        for (let r = ent.gridRow - 1; r <= ent.gridRow + 2; r++) {
          for (let c = ent.gridCol - 1; c <= ent.gridCol + 2; c++) {
            if (r < 0 || r >= 64 || c < 0 || c >= 64) continue;
            const inner = r >= ent.gridRow && r <= ent.gridRow + 1 && c >= ent.gridCol && c <= ent.gridCol + 1;
            if (inner) continue; // skip interior
            const attr = result.attrGrid![r][c];
            const reached = result.reachable[r][c];
            adjTiles.push(`(${r},${c}) a=0x${attr.toString(16)} r=${reached}`);
          }
        }
        console.log(`    adj ring: ${adjTiles.join(' | ')}`);

        // Find nearest reachable tile to entrance
        let minDist = Infinity;
        let nearestReachable = '';
        for (let r = Math.max(0, ent.gridRow - 10); r <= Math.min(63, ent.gridRow + 10); r++) {
          for (let c = Math.max(0, ent.gridCol - 10); c <= Math.min(63, ent.gridCol + 10); c++) {
            if (result.reachable[r][c]) {
              const d = Math.abs(r - ent.gridRow) + Math.abs(c - ent.gridCol);
              if (d < minDist) {
                minDist = d;
                nearestReachable = `(${r},${c}) attr=0x${result.attrGrid![r][c].toString(16)}`;
              }
            }
          }
        }
        console.log(`    nearest reachable (within 10): dist=${minDist} at ${nearestReachable}`);
      }
    }
  });

  it('checks if the position decode is correct for big-screen entrances', () => {
    const entrances = getEntrances(rom);

    // Focus on the secret passage (slot 49, area=0x1B, room=0x55)
    const secretPassage = entrances[49];
    console.log('\n=== Secret Passage Position Decode ===');
    console.log(`  Slot 49: area=0x${secretPassage.area.toString(16)} id=${secretPassage.id} room=0x${secretPassage.roomId.toString(16)}`);
    console.log(`  Raw pos=0x${secretPassage.pos.toString(16)}`);

    const pos = secretPassage.pos;
    const map16Y = pos >> 7;
    const map16X = (pos & 0x7F) >> 1;
    console.log(`  Decoded: map16X=${map16X}, map16Y=${map16Y}`);
    console.log(`  Grid (mod 32): row=${(map16Y % 32) * 2}, col=${(map16X % 32) * 2}`);

    // For big screens, coordinates are in the full 64×64 space.
    // Area head determines the base screen. Position quadrant determines sub-screen.
    // Check if area is an area head and if position exceeds 32.
    if (map16X >= 32 || map16Y >= 32) {
      console.log(`  *** BIG SCREEN: position exceeds 32×32 local grid!`);
      console.log(`  *** map16X=${map16X} → right-half? ${map16X >= 32}`);
      console.log(`  *** map16Y=${map16Y} → bottom-half? ${map16Y >= 32}`);

      // The area table says screen 0x1B. If the coordinates are in the right half,
      // maybe the entrance is actually on a different sub-screen.
      const baseCol = secretPassage.area & 7;
      const baseRow = (secretPassage.area >> 3) & 7;
      const adjCol = map16X >= 32 ? baseCol + 1 : baseCol;
      const adjRow = map16Y >= 32 ? baseRow + 1 : baseRow;
      const actualScreen = (adjRow << 3) | adjCol;
      console.log(`  *** Area screen: (${baseRow},${baseCol}) = 0x${secretPassage.area.toString(16)}`);
      console.log(`  *** Actual target screen: (${adjRow},${adjCol}) = 0x${actualScreen.toString(16)}`);
    }

    // Also dump Link's house for comparison
    const linksHouse = entrances.find(e => e.area === 0x2C);
    if (linksHouse) {
      console.log('\n=== Link\'s House Position Decode ===');
      console.log(`  Slot ${entrances.indexOf(linksHouse)}: area=0x${linksHouse.area.toString(16)} id=${linksHouse.id} room=0x${linksHouse.roomId.toString(16)}`);
      console.log(`  Raw pos=0x${linksHouse.pos.toString(16)}`);
      const lhPos = linksHouse.pos;
      const lhX = (lhPos & 0x7F) >> 1;
      const lhY = lhPos >> 7;
      console.log(`  Decoded: map16X=${lhX}, map16Y=${lhY}`);
      console.log(`  Grid (mod 32): row=${(lhY % 32) * 2}, col=${(lhX % 32) * 2}`);
    }
  });

  it('traces BFS blockage from Link position to secret passage on 0x1C', () => {
    const entrances = getEntrances(rom);
    const secretPassage = entrances.find(e => e.area === 0x1C && e.roomId === 0x55)!;
    console.log(`\nSecret Passage: area=0x${secretPassage.area.toString(16)} grid=(${secretPassage.gridRow},${secretPassage.gridCol})`);

    // Step 1-3 chain as before
    const step1 = floodFillScreen(rom, 0x1C, new Set(['lift.1']), { row: 26, col: 44 });
    const southT = step1.transitions.filter(t => t.edge === 'south');
    const step2 = floodFillScreen(rom, 0x24, new Set(['lift.1']), { row: 0, col: southT[0].col });
    const westT = step2.transitions.filter(t => t.edge === 'west');
    const step3 = floodFillScreen(rom, 0x23, new Set(['lift.1']), { row: westT[0].row, col: 63 });
    const northT = step3.transitions.filter(t => t.edge === 'north');
    console.log(`0x23 north border transitions (${northT.length}): cols=[${northT.map(t => t.col).join(',')}]`);

    // Try ALL north border cols as entry points into 0x1B
    let found = false;
    for (const nt of northT) {
      const r = floodFillScreen(rom, 0x1B, new Set(['lift.1']), { row: 63, col: nt.col });
      const eastBorders = r.transitions.filter(t => t.edge === 'east');
      if (eastBorders.length > 0) {
        console.log(`  0x1B from (63,${nt.col}): ${r.reachableCount} tiles, EAST BORDERS: ${eastBorders.length} at rows [${eastBorders.slice(0, 5).map(t => t.row).join(',')}...]`);
        // Follow to 0x1C
        const reentry = floodFillScreen(rom, 0x1C, new Set(['lift.1']), { row: eastBorders[0].row, col: 0 });
        const entDet = reentry.transitions.some(t => t.edge === 'entrance' && t.entranceIdx === secretPassage.id);
        console.log(`  0x1C reseed from (${eastBorders[0].row},0): ${reentry.reachableCount} tiles, ENTRANCE: ${entDet}`);
        found = true;
        break;
      }
    }
    if (!found) {
      console.log(`  No 0x1B entry reaches east border from ANY 0x23 north transition`);
      // Alternative: check 0x1B from various entry points
      console.log(`\n  Checking 0x1B directly from various positions:`);
      for (const col of [0, 10, 20, 30, 40, 50, 60, 63]) {
        const r = floodFillScreen(rom, 0x1B, new Set(['lift.1']), { row: 32, col });
        const east = r.transitions.filter(t => t.edge === 'east').length;
        const north = r.transitions.filter(t => t.edge === 'north').length;
        const south = r.transitions.filter(t => t.edge === 'south').length;
        const west = r.transitions.filter(t => t.edge === 'west').length;
        console.log(`    (32,${col}): ${r.reachableCount} tiles, N=${north} S=${south} E=${east} W=${west}`);
      }
    }

    // Also: try entering 0x1C from 0x1B's perspective — is there ANY way?
    // Check if 0x1B can reach east border from center
    const r1bCenter = floodFillScreen(rom, 0x1B, new Set(['lift.1']), { row: 32, col: 32 });
    console.log(`\n0x1B from center (32,32): ${r1bCenter.reachableCount} tiles`);
    console.log(`  East: ${r1bCenter.transitions.filter(t => t.edge === 'east').length}`);
    console.log(`  South: ${r1bCenter.transitions.filter(t => t.edge === 'south').length}`);
  });
});
