import { describe, it, beforeAll } from 'vitest';
import { existsSync } from 'fs';
import { join } from 'path';
import { loadRom, type RomData } from '../../shared/asset-extraction/rom';
import { floodFillScreen } from '../../shared/game/navigation/flood-fill';
import { classifyTileAttr } from '../../shared/game/navigation/tile-classification';

const ROM_PATH = join(__dirname, '..', '..', 'test-roms', 'Legend of Zelda, The - A Link to the Past (USA).sfc');
const romAvailable = existsSync(ROM_PATH);

describe.skipIf(!romAvailable)('Screen 0x31 internal connectivity', () => {
  let rom: RomData;

  beforeAll(() => {
    rom = loadRom(ROM_PATH);
  });

  it('analyzes 0x31 (Desert NE) border and cliff data', () => {
    const inv = new Set(['lift.0', 'lift.1']);
    const result = floodFillScreen(rom, 0x31, inv);

    let reach = 0;
    for (let r = 0; r < 64; r++)
      for (let c = 0; c < 64; c++)
        if (result.reachable[r]?.[c]) reach++;

    // Border stats
    let n = 0, s = 0, e = 0, w = 0;
    for (let i = 0; i < 64; i++) {
      if (result.reachable[0]?.[i]) n++;
      if (result.reachable[63]?.[i]) s++;
      if (result.reachable[i]?.[63]) e++;
      if (result.reachable[i]?.[0]) w++;
    }
    console.log('=== Screen 0x31 (Desert NE) ===');
    console.log(`Reachable: ${reach}/4096`);
    console.log(`Borders: N=${n} S=${s} E=${e} W=${w}`);

    // Show attrs along north edge rows 0-5
    console.log('\nNorth region attrs (rows 0-7):');
    for (let r = 0; r < 8; r++) {
      const attrs: string[] = [];
      for (let c = 0; c < 64; c += 4) {
        const attr = result.attrGrid[r][c];
        const cls = classifyTileAttr(attr);
        const reachable = result.reachable[r]?.[c] ? '✓' : '✗';
        attrs.push(`${reachable}${attr.toString(16).padStart(2, '0')}`);
      }
      console.log(`  row ${r.toString().padStart(2)}: ${attrs.join(' ')}`);
    }

    // Check for ledge tiles in the upper portion (rows 0-20)
    console.log('\nLedge tiles (type=ledge) in rows 0-20:');
    const ledges: { r: number; c: number; attr: string; dir: string }[] = [];
    for (let r = 0; r < 20; r++) {
      for (let c = 0; c < 64; c++) {
        const attr = result.attrGrid[r][c];
        const cls = classifyTileAttr(attr);
        if (cls.type === 'ledge') {
          ledges.push({ r, c, attr: '0x' + attr.toString(16), dir: (cls as any).dir });
        }
      }
    }
    console.log(`  Count: ${ledges.length}`);
    if (ledges.length > 0) {
      // Group by row
      const byRow = new Map<number, typeof ledges>();
      for (const l of ledges) {
        if (!byRow.has(l.r)) byRow.set(l.r, []);
        byRow.get(l.r)!.push(l);
      }
      for (const [row, tiles] of byRow) {
        const dirs = [...new Set(tiles.map(t => t.dir))];
        const colRange = `cols ${tiles[0].c}-${tiles[tiles.length - 1].c}`;
        console.log(`    row ${row}: ${tiles.length} tiles, ${colRange}, dirs=${dirs.join(',')}`);
      }
    }

    // Check blocked/cliff tiles forming a barrier in rows 5-15
    console.log('\nHorizontal barrier scan (looking for full-width obstacles):');
    for (let r = 0; r < 25; r++) {
      let blocked = 0;
      let free = 0;
      let ledge = 0;
      for (let c = 0; c < 64; c++) {
        const cls = classifyTileAttr(result.attrGrid[r][c]);
        if (cls.type === 'blocked') blocked++;
        else if (cls.type === 'free') free++;
        else if (cls.type === 'ledge') ledge++;
      }
      if (blocked > 50 || ledge > 10) {
        console.log(`  row ${r.toString().padStart(2)}: blocked=${blocked} free=${free} ledge=${ledge}`);
      }
    }

    // Check: can the flood fill reach row 0 from row 49 (where it enters from west)?
    // The entry from 0x30 is at (49,0). Let's check connectivity.
    console.log('\nReachability by row (sampled every 5 rows):');
    for (let r = 0; r < 64; r += 5) {
      let count = 0;
      for (let c = 0; c < 64; c++) if (result.reachable[r]?.[c]) count++;
      console.log(`  row ${r.toString().padStart(2)}: ${count} reachable tiles`);
    }
  });

  it('checks 0x29 (Kakariko South Annex) south border', () => {
    const inv = new Set(['lift.0', 'lift.1']);
    const result = floodFillScreen(rom, 0x29, inv);

    let reach = 0;
    for (let r = 0; r < 64; r++)
      for (let c = 0; c < 64; c++)
        if (result.reachable[r]?.[c]) reach++;

    let n = 0, s = 0, e = 0, w = 0;
    for (let i = 0; i < 64; i++) {
      if (result.reachable[0]?.[i]) n++;
      if (result.reachable[63]?.[i]) s++;
      if (result.reachable[i]?.[63]) e++;
      if (result.reachable[i]?.[0]) w++;
    }
    console.log('\n=== Screen 0x29 (Kakariko South Annex) ===');
    console.log(`Reachable: ${reach}/4096`);
    console.log(`Borders: N=${n} S=${s} E=${e} W=${w}`);

    // Check south border attrs
    console.log('\nSouth border (row 63) attrs:');
    const southAttrs: string[] = [];
    for (let c = 0; c < 64; c += 4) {
      const attr = result.attrGrid[63][c];
      const reachable = result.reachable[63]?.[c] ? '✓' : '✗';
      southAttrs.push(`${reachable}${attr.toString(16).padStart(2, '0')}`);
    }
    console.log(`  ${southAttrs.join(' ')}`);

    // Check what's along rows 58-63 (near south border)
    console.log('\nSouth region rows 58-63:');
    for (let r = 58; r < 64; r++) {
      let blocked = 0, free = 0, ledge = 0;
      for (let c = 0; c < 64; c++) {
        const cls = classifyTileAttr(result.attrGrid[r][c]);
        if (cls.type === 'blocked') blocked++;
        else if (cls.type === 'free') free++;
        else if (cls.type === 'ledge') ledge++;
      }
      const reachCount = Array.from({ length: 64 }, (_, c) => result.reachable[r]?.[c] ? 1 : 0).reduce((a, b) => a + b, 0);
      console.log(`  row ${r}: blocked=${blocked} free=${free} ledge=${ledge} reachable=${reachCount}`);
    }
  });
});
