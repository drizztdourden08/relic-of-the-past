import { describe, it, beforeAll } from 'vitest';
import { existsSync } from 'fs';
import { join } from 'path';
import { loadRom, type RomData } from '../../shared/asset-extraction/rom';
import { floodFillScreen } from '../../shared/game/navigation/flood-fill';
import { findScreenPath } from '../../shared/game/navigation/screen-hop';
import { planRoute, type Location } from '../../shared/game/navigation/route-planner';
import { classifyTileAttr } from '../../shared/game/navigation/tile-classification';

const ROM_PATH = join(__dirname, '..', '..', 'test-roms', 'Legend of Zelda, The - A Link to the Past (USA).sfc');
const romAvailable = existsSync(ROM_PATH);

describe.skipIf(!romAvailable)('Desert ↔ Maze connectivity', () => {
  let rom: RomData;

  beforeAll(() => {
    rom = loadRom(ROM_PATH);
  });

  it('checks border connectivity between 0x28 (Maze) and 0x30 (Desert NW)', () => {
    const inv = new Set(['lift.0', 'lift.1']);

    // Screen 0x28 = Kakariko Maze (row 5, col 0)
    const r28 = floodFillScreen(rom, 0x28, inv);
    let reach28 = 0;
    let south28 = 0; // row 63 = south border
    const south28Tiles: { col: number; attr: string }[] = [];
    for (let r = 0; r < 64; r++)
      for (let c = 0; c < 64; c++)
        if (r28.reachable[r]?.[c]) reach28++;
    for (let c = 0; c < 64; c++) {
      if (r28.reachable[63]?.[c]) {
        south28++;
        south28Tiles.push({ col: c, attr: '0x' + r28.attrGrid[63][c].toString(16) });
      }
    }

    console.log('=== Screen 0x28 (Kakariko Maze) ===');
    console.log(`  Reachable: ${reach28}/4096`);
    console.log(`  South border (row 63): ${south28} reachable tiles`);
    if (south28Tiles.length > 0) console.log(`    Tiles:`, south28Tiles.slice(0, 10));

    // Check what attrs are at the south border even if not reachable
    const south28Attrs = new Map<string, number>();
    for (let c = 0; c < 64; c++) {
      const a = '0x' + r28.attrGrid[63][c].toString(16);
      south28Attrs.set(a, (south28Attrs.get(a) || 0) + 1);
    }
    console.log(`  South border attrs:`, Object.fromEntries(south28Attrs));

    // Screen 0x30 = Desert of Mystery NW (row 6, col 0) — directly south of 0x28
    const r30 = floodFillScreen(rom, 0x30, inv);
    let reach30 = 0;
    let north30 = 0; // row 0 = north border
    const north30Tiles: { col: number; attr: string }[] = [];
    for (let r = 0; r < 64; r++)
      for (let c = 0; c < 64; c++)
        if (r30.reachable[r]?.[c]) reach30++;
    for (let c = 0; c < 64; c++) {
      if (r30.reachable[0]?.[c]) {
        north30++;
        north30Tiles.push({ col: c, attr: '0x' + r30.attrGrid[0][c].toString(16) });
      }
    }

    console.log('\n=== Screen 0x30 (Desert NW) ===');
    console.log(`  Reachable: ${reach30}/4096`);
    console.log(`  North border (row 0): ${north30} reachable tiles`);
    if (north30Tiles.length > 0) console.log(`    Tiles:`, north30Tiles.slice(0, 10));

    const north30Attrs = new Map<string, number>();
    for (let c = 0; c < 64; c++) {
      const a = '0x' + r30.attrGrid[0][c].toString(16);
      north30Attrs.set(a, (north30Attrs.get(a) || 0) + 1);
    }
    console.log(`  North border attrs:`, Object.fromEntries(north30Attrs));

    // Check overlapping columns (both reachable at south-28 and north-30)
    let overlap = 0;
    const overlapCols: number[] = [];
    for (let c = 0; c < 64; c++) {
      if (r28.reachable[63]?.[c] && r30.reachable[0]?.[c]) {
        overlap++;
        overlapCols.push(c);
      }
    }
    console.log(`\n=== Border Overlap ===`);
    console.log(`  Shared passable columns: ${overlap}`);
    if (overlapCols.length > 0) console.log(`    Columns:`, overlapCols);
    console.log(`  Connection valid: ${overlap > 0 ? 'YES' : 'NO'}`);

    // Also check all borders of both screens
    console.log('\n=== Full border summary ===');
    let n28 = 0, e28 = 0, w28 = 0;
    for (let i = 0; i < 64; i++) {
      if (r28.reachable[0]?.[i]) n28++;
      if (r28.reachable[i]?.[63]) e28++;
      if (r28.reachable[i]?.[0]) w28++;
    }
    console.log(`  0x28 borders: N=${n28} S=${south28} E=${e28} W=${w28}`);

    let s30 = 0, e30 = 0, w30 = 0;
    for (let i = 0; i < 64; i++) {
      if (r30.reachable[63]?.[i]) s30++;
      if (r30.reachable[i]?.[63]) e30++;
      if (r30.reachable[i]?.[0]) w30++;
    }
    console.log(`  0x30 borders: N=${north30} S=${s30} E=${e30} W=${w30}`);
  });

  it('checks screen-hop path from Desert Palace area to Maze', () => {
    const inv = new Set(['lift.0', 'lift.1']);

    // Screen 0x38 (Desert Palace SW) → Screen 0x28 (Kakariko Maze)
    const path = findScreenPath(rom, 0x38, 0x28, inv);
    console.log('\n=== Screen-hop: 0x38 (Desert SW) → 0x28 (Maze) ===');
    if (path) {
      console.log(`  Screens: ${path.screens.map(s => '0x' + s.toString(16)).join(' → ')}`);
      console.log(`  Count: ${path.screens.length}`);
    } else {
      console.log('  NULL — no screen-hop path found');
      // Try from 0x30 directly
      const path2 = findScreenPath(rom, 0x30, 0x28, inv);
      console.log(`  0x30 → 0x28: ${path2 ? path2.screens.map(s => '0x' + s.toString(16)).join(' → ') : 'NULL'}`);
    }
  });

  it('attempts route from Desert Palace entrance to Maze Race finish', () => {
    const inv = new Set(['lift.0', 'lift.1']);

    // Desert Palace dungeon entrance region
    const source: Location = { regionId: 'lw-38' };
    // Maze Race area — the cliff top where the guy stands
    // Maze Race ledge is on screen 0x28, upper portion
    const target: Location = { regionId: 'lw-28', tile: { row: 10, col: 32 } };

    const result = planRoute(rom, source, target, inv);

    console.log('\n=== Route: Desert Palace Area → Maze Race ===');
    if (result) {
      console.log(`Total screens: ${result.totalScreens}`);
      console.log(`Total tile steps: ${result.totalSteps}`);
      console.log(`Requirements: ${result.requirements.length ? result.requirements.join(', ') : 'none'}`);
      console.log('');
      for (const step of result.steps) {
        console.log(`  [0x${step.screenIndex.toString(16).padStart(2, '0')}] ${step.screenName}`);
        console.log(`    Entry: (${step.entry.row}, ${step.entry.col}) → Exit: (${step.exit.row}, ${step.exit.col})`);
        console.log(`    Tile steps: ${step.tileSteps}`);
      }
    } else {
      console.log('  NULL — no route found');
      console.log('  This confirms the desert and maze are NOT connected at tile level');
    }
  });
});
