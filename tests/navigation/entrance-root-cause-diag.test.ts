import { describe, it, beforeAll } from 'vitest';
import { existsSync } from 'fs';
import { join } from 'path';
import { loadRom, type RomData } from '../../shared/asset-extraction/rom';
import { floodFillScreen } from '../../shared/game/navigation/flood-fill';

const ROM_PATH = join(__dirname, '..', '..', 'test-roms', 'Legend of Zelda, The - A Link to the Past (USA).sfc');
const romAvailable = existsSync(ROM_PATH);

function detectedByOldProximity(
  reachable: boolean[][],
  entRow: number,
  entCol: number,
): boolean {
  for (let r = 0; r < 64; r++) {
    for (let c = 0; c < 64; c++) {
      if (!reachable[r][c]) continue;
      if (Math.abs(r - entRow) <= 6 && Math.abs(c - entCol) <= 6) return true;
    }
  }
  return false;
}

function detectedByTriggerFootprint(
  reachable: boolean[][],
  entRow: number,
  entCol: number,
): boolean {
  for (let r = entRow; r <= entRow + 1; r++) {
    for (let c = entCol; c <= entCol + 1; c++) {
      if (r < 0 || r >= 64 || c < 0 || c >= 64) continue;
      if (reachable[r][c]) return true;
    }
  }
  return false;
}

describe.skipIf(!romAvailable)('Entrance Root Cause Diagnostic', () => {
  let rom: RomData;

  beforeAll(() => {
    rom = loadRom(ROM_PATH);
  });

  it('shows why floating entrances appeared on Hyrule Castle screens', () => {
    const inv = new Set(['lift.1']);
    const screens = [0x1b, 0x23, 0x24];

    for (const screenIndex of screens) {
      const result = floodFillScreen(rom, screenIndex, inv, { row: 14, col: 20 });

      const oldDetected = result.entrances.filter(ent =>
        detectedByOldProximity(result.reachable, ent.gridRow, ent.gridCol),
      );

      const triggerDetected = result.entrances.filter(ent =>
        detectedByTriggerFootprint(result.reachable, ent.gridRow, ent.gridCol),
      );

      const oldOnly = oldDetected.filter(o =>
        !triggerDetected.some(t => t.id === o.id),
      );

      console.log(`\n=== Entrance root-cause diagnostic: screen 0x${screenIndex.toString(16)} ===`);
      console.log(`Reachable: ${result.reachableCount}/${result.totalTiles}`);
      console.log(`Entrances in area table: ${result.entrances.length}`);
      console.log(`Detected by OLD <=6 proximity rule: ${oldDetected.length}`);
      console.log(`Detected by exact 2x2 trigger footprint: ${triggerDetected.length}`);
      console.log(`Floating false positives caused by old rule: ${oldOnly.length}`);

      if (oldOnly.length > 0) {
        console.log('\nOld-rule-only entrances (would appear floating):');
        for (const ent of oldOnly) {
          let nearest = 999;
          for (let r = 0; r < 64; r++) {
            for (let c = 0; c < 64; c++) {
              if (!result.reachable[r][c]) continue;
              const d = Math.max(Math.abs(r - ent.gridRow), Math.abs(c - ent.gridCol));
              if (d < nearest) nearest = d;
            }
          }
          console.log(`  #${ent.id} room=0x${ent.roomId.toString(16)} at (${ent.gridRow},${ent.gridCol}) nearestReachChebyshev=${nearest}`);

          const t00r = ent.gridRow;
          const t00c = ent.gridCol;
          const cells = [
            [t00r, t00c],
            [t00r, t00c + 1],
            [t00r + 1, t00c],
            [t00r + 1, t00c + 1],
          ] as const;
          for (const [rr, cc] of cells) {
            const attr = result.attrGrid?.[rr]?.[cc];
            const reach = result.reachable?.[rr]?.[cc];
            console.log(`    trigger cell (${rr},${cc}) attr=0x${(attr ?? 0).toString(16)} reachable=${!!reach}`);
          }
        }
      }
    }
  });
});
