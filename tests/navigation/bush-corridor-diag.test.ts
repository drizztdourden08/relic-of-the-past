/**
 * Diagnostic test for two scenarios:
 * A) Bush field tiles should be reachable (pink) with lift.1
 * B) 1x1 narrow corridor should be unreachable
 *
 * Screens: 0x23 (Hyrule Castle NW), 0x24 (Hyrule Castle NE?)
 * Run: npx vitest run tests/navigation/bush-corridor-diag.test.ts
 */
import { describe, it, beforeAll } from 'vitest';
import { existsSync } from 'fs';
import { join } from 'path';
import { loadRom, type RomData } from '../../shared/asset-extraction/rom';
import { floodFillScreen } from '../../shared/game/navigation/flood-fill';
import { classifyTileAttr } from '../../shared/game/navigation/tile-classification';

const ROM_PATH = join(__dirname, '..', '..', 'test-roms', 'Legend of Zelda, The - A Link to the Past (USA).sfc');
const romAvailable = existsSync(ROM_PATH);

// From screenshots:
// Screen 0x23, Link at sub-tiles c25-27 r50-52 → startRow≈51, startCol≈26
// Screen 0x24, Link at sub-tiles c27-29 r50-52 → startRow≈51, startCol≈28
//
// Tile inspector uses [col, row] notation:
//   [52,24] thick grass  on 0x23
//   [59,17] diggable     on 0x23 (should be reachable, likely need to confirm)
//   [56,25] bush lift.1  on 0x24 (should be PINK with lift.1)
//   [50,48] bush lift.1  on 0x24 (should be PINK with lift.1)
// "screenshot 7" tile = small path with light rock (unreachable) - position TBD

function dumpArea(label: string, attrGrid: number[][], reachable: boolean[][], reqGrid: string[][], centerRow: number, centerCol: number, radius = 4) {
  console.log(`\n=== ${label} — area around [col=${centerCol}, row=${centerRow}] ===`);
  console.log('Format: [col,row] attr type reachable req');
  for (let r = centerRow - radius; r <= centerRow + radius; r++) {
    const parts: string[] = [];
    for (let c = centerCol - radius; c <= centerCol + radius; c++) {
      if (r < 0 || r >= 64 || c < 0 || c >= 64) { parts.push('OOB'); continue; }
      const attr = attrGrid[r][c];
      const classified = classifyTileAttr(attr);
      const reach = reachable[r]?.[c] ? 'Y' : 'N';
      const req = reqGrid[r]?.[c] || '';
      const marker = (r === centerRow && c === centerCol) ? '>>>' : '   ';
      parts.push(`${marker}[${c},${r}]=0x${attr.toString(16).padStart(2,'0')}(${classified.type.slice(0,3)})${reach}${req ? ':'+req : ''}`);
    }
    console.log(parts.join('  '));
  }
}

describe.skipIf(!romAvailable)('Bush/Corridor Diagnostic', () => {
  let rom: RomData;

  function logPoint(
    label: string,
    result: ReturnType<typeof floodFillScreen>,
    row: number,
    col: number,
  ) {
    const attr = result.attrGrid[row]?.[col];
    const cls = attr !== undefined ? classifyTileAttr(attr) : null;
    const reachable = result.reachable[row]?.[col] ?? false;
    const req = result.reqGrid[row]?.[col] ?? '';
    console.log(`${label} [row=${row},col=${col}] attr=${attr === undefined ? 'OOB' : '0x' + attr.toString(16)} type=${cls?.type ?? 'n/a'} reachable=${reachable} req='${req}'`);
  }

  beforeAll(() => {
    rom = loadRom(ROM_PATH);
  });

  it('Screen 0x23: dumps tile areas of interest with lift.1 inventory', () => {
    const inv = new Set(['lift.1']);
    const result = floodFillScreen(rom, 0x23, inv, { row: 51, col: 26 });
    const { reachable, reqGrid, attrGrid } = result as any;

    console.log(`\nScreen 0x23 — Reachable: ${result.reachableCount}/4096`);

    // [52,24] thick grass — should be reachable free
    dumpArea('0x23 [col=52,row=24] thick grass', attrGrid, reachable, reqGrid, 24, 52);

    // [59,17] diggable — should be reachable (pink or blue?)
    dumpArea('0x23 [col=59,row=17] diggable', attrGrid, reachable, reqGrid, 17, 59);

    // Verify specific tiles
    console.log('\n--- Specific tile assertions ---');
    console.log(`[col=52, row=24] attr=0x${attrGrid[24][52].toString(16)} reachable=${reachable[24]?.[52]} req='${reqGrid[24]?.[52]}'`);
    console.log(`[col=59, row=17] attr=0x${attrGrid[17][59].toString(16)} reachable=${reachable[17]?.[59]} req='${reqGrid[17]?.[59]}'`);
  });

  it('Screen 0x24: dumps bush field and narrow corridor tiles', () => {
    const inv = new Set(['lift.1']);
    const result = floodFillScreen(rom, 0x24, inv, { row: 51, col: 28 });
    const { reachable, reqGrid, attrGrid } = result as any;

    console.log(`\nScreen 0x24 — Reachable: ${result.reachableCount}/4096`);

    // [56,25] bush — should be PINK (reachable with lift.1 req)
    dumpArea('0x24 [col=56,row=25] bush lift.1', attrGrid, reachable, reqGrid, 25, 56, 5);

    // [50,48] bush — should be PINK
    dumpArea('0x24 [col=50,row=48] bush lift.1', attrGrid, reachable, reqGrid, 48, 50, 5);

    // Log specific tile assertions
    console.log('\n--- Specific tile assertions ---');
    console.log(`[col=56, row=25] attr=0x${attrGrid[25][56].toString(16)} reachable=${reachable[25]?.[56]} req='${reqGrid[25]?.[56]}'`);
    console.log(`[col=50, row=48] attr=0x${attrGrid[48][50].toString(16)} reachable=${reachable[48]?.[50]} req='${reqGrid[48]?.[50]}'`);

    // Scan for narrow bottleneck corridors: look for columns of tiles where
    // a single tile wide free path exists bordered by non-blocked obstacles
    console.log('\n--- Scanning for 1-tile-wide free paths bordered by obstacles ---');
    let found = 0;
    for (let r = 10; r < 60; r++) {
      for (let c = 5; c < 59; c++) {
        const t = classifyTileAttr(attrGrid[r][c]);
        if (t.type !== 'free') continue;
        // Check: is this tile reachable, while having obstacle-walled neighbors?
        // Look for a vertical corridor: left=obstacle/blocked, right=obstacle/blocked
        const left = classifyTileAttr(attrGrid[r][c-1]);
        const right = classifyTileAttr(attrGrid[r][c+1]);
        if ((left.type === 'obstacle' || left.type === 'blocked') &&
            (right.type === 'obstacle' || right.type === 'blocked') &&
            reachable[r]?.[c]) {
          console.log(`  Narrow vertical corridor at [col=${c},row=${r}] attr=0x${attrGrid[r][c].toString(16)} LEFT=0x${attrGrid[r][c-1].toString(16)}(${left.type}) RIGHT=0x${attrGrid[r][c+1].toString(16)}(${right.type}) reachable=${reachable[r]?.[c]}`);
          found++;
          if (found >= 20) { console.log('  (truncated)'); break; }
        }
      }
      if (found >= 20) break;
    }
    if (found === 0) console.log('  None found');
  });

  it('Screen 0x23: without any inventory', () => {
    const inv = new Set<string>();
    const result = floodFillScreen(rom, 0x23, inv, { row: 51, col: 26 });
    const { reachable, reqGrid, attrGrid } = result as any;

    console.log(`\nScreen 0x23 (no inventory) — Reachable: ${result.reachableCount}/4096`);
    console.log(`[col=52, row=24] reachable=${reachable[24]?.[52]}`);
    console.log(`[col=59, row=17] reachable=${reachable[17]?.[59]}`);
  });

  it('Screenshot coordinate checks (displayed + transposed)', () => {
    const inv = new Set(['lift.1']);

    const s23 = floodFillScreen(rom, 0x23, inv, { row: 51, col: 26 });
    const s24 = floodFillScreen(rom, 0x24, inv, { row: 52, col: 20 });

    console.log('\n=== Screen 0x23 target from screenshot [59,17] ===');
    logPoint('displayed', s23, 59, 17);
    logPoint('transposed', s23, 17, 59);

    console.log('\n=== Screen 0x24 start from screenshot [52,20] ===');
    logPoint('displayed', s24, 52, 20);
    logPoint('transposed', s24, 20, 52);

    console.log('\n=== Screen 0x24 target from screenshot [56,25] (should be pink) ===');
    logPoint('displayed', s24, 56, 25);
    logPoint('transposed', s24, 25, 56);

    console.log('\n=== Screen 0x24 target from screenshot [50,48] (should be unreachable) ===');
    logPoint('displayed', s24, 50, 48);
    logPoint('transposed', s24, 48, 50);

    console.log('\n=== Screen 0x24 newly reported tile [54,53] (should be reachable/pink after lift.1) ===');
    logPoint('displayed', s24, 54, 53);
    logPoint('transposed', s24, 53, 54);

    dumpArea('0x24 displayed [row=56,col=25]', s24.attrGrid, s24.reachable, s24.reqGrid, 56, 25, 4);
    dumpArea('0x24 displayed [row=50,col=48]', s24.attrGrid, s24.reachable, s24.reqGrid, 50, 48, 4);
    dumpArea('0x24 displayed [row=54,col=53]', s24.attrGrid, s24.reachable, s24.reqGrid, 54, 53, 4);
  });
});
