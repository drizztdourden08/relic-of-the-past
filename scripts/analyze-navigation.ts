/**
 * Navigation Analysis Script
 *
 * Runs the global flood fill against a ROM and updates the region/connection data.
 *
 * Usage:
 *   npx tsx scripts/analyze-navigation.ts [options]
 *
 * Options:
 *   --rom <path>           Path to ROM (default: test-roms/...USA.sfc)
 *   --screens <range>      Only analyze specific screens (e.g. "0x00-0x3F")
 *   --update-regions       Write nav data to region files
 *   --update-connections   Write nav data to connection files
 *   --dry-run              Print changes without writing
 *   --verbose              Show per-screen details
 */

import { existsSync } from 'fs';
import { join } from 'path';
import { loadRom } from '../shared/asset-extraction/rom/rom-loader';
import { globalFlood } from '../shared/game/navigation/analysis/global-flood';

const DEFAULT_ROM = join(__dirname, '..', 'test-roms', 'Legend of Zelda, The - A Link to the Past (USA).sfc');

function parseArgs() {
  const args = process.argv.slice(2);
  return {
    rom: args.find((_, i, a) => a[i - 1] === '--rom') ?? DEFAULT_ROM,
    dryRun: args.includes('--dry-run'),
    verbose: args.includes('--verbose'),
    updateRegions: args.includes('--update-regions'),
    updateConnections: args.includes('--update-connections'),
  };
}

async function main() {
  const opts = parseArgs();

  if (!existsSync(opts.rom)) {
    console.error(`ROM not found: ${opts.rom}`);
    process.exit(1);
  }

  console.log(`Loading ROM: ${opts.rom}`);
  const rom = loadRom(opts.rom);

  console.log('Running global flood fill from Link\'s House area (screen 0x2C)...');
  const result = globalFlood({
    rom,
    startScreen: 0x2C,
    startPos: { row: 50, col: 30 }, // outdoor area south of Link's House
    onProgress: (done, total) => {
      if (opts.verbose) {
        process.stdout.write(`\r  Screens analyzed: ${done}/${total}`);
      }
    },
  });

  if (opts.verbose) console.log('');

  console.log(`\nResults:`);
  console.log(`  Screens reached: ${result.screens.size} / 128`);
  console.log(`  Connections found: ${result.connections.length}`);
  console.log(`  Unreachable screens: ${result.unreachable.length}`);
  console.log(`  Time: ${result.elapsedMs.toFixed(0)}ms`);

  // Show reached screens
  const reached = [...result.screens.keys()].sort((a, b) => a - b);
  console.log(`\n  Reached: ${reached.map(s => `0x${s.toString(16).padStart(2, '0')}`).join(', ')}`);

  if (result.unreachable.length > 0 && result.unreachable.length <= 30) {
    console.log(`  Unreachable: ${result.unreachable.map(s => `0x${s.toString(16).padStart(2, '0')}`).join(', ')}`);
  } else if (result.unreachable.length > 30) {
    console.log(`  Unreachable: ${result.unreachable.length} screens (too many to list)`);
  }

  if (opts.dryRun) {
    console.log('\n[DRY RUN] No files modified.');
    return;
  }

  if (opts.updateRegions) {
    console.log('\nUpdating region files...');
    // TODO: Phase 4 — call region-updater
    console.log('  (not yet implemented)');
  }

  if (opts.updateConnections) {
    console.log('\nUpdating connection files...');
    // TODO: Phase 4 — call connection-updater
    console.log('  (not yet implemented)');
  }

  console.log('\nDone.');
}

main().catch(e => { console.error(e); process.exit(1); });
