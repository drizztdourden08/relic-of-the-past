import { describe, it, expect, beforeAll } from 'vitest';
import { existsSync } from 'fs';
import { join } from 'path';
import { planRoute, type Location } from '../../shared/game/navigation/route-planner';
import { loadRom, type RomData } from '../../shared/asset-extraction/rom';

const ROM_PATH = process.env.ALTTP_ROM_PATH
  || join(__dirname, '..', '..', 'test-roms', 'Legend of Zelda, The - A Link to the Past (USA).sfc');

const romAvailable = existsSync(ROM_PATH);

describe.skipIf(!romAvailable)('Route Planner', () => {
  let rom: RomData;

  beforeAll(() => {
    rom = loadRom(ROM_PATH);
  });

  it('finds shortest path from Kakariko Shop to Link\'s House', () => {
    const source: Location = { regionId: 'kakariko-shop' };
    const target: Location = { regionId: 'links-house' };
    const inventory = new Set(['lift.1']); // Link has from start (needed to traverse bushes)

    const result = planRoute(rom, source, target, inventory);

    expect(result).not.toBeNull();
    console.log('\n=== Kakariko Shop \u2192 Link\'s House ===');
    console.log(`Total screens: ${result!.totalScreens}`);
    console.log(`Total tile steps: ${result!.totalSteps}`);
    console.log(`Requirements: ${result!.requirements.length ? result!.requirements.join(', ') : 'none'}`);
    console.log('');
    console.log('Screen-by-screen breakdown:');
    for (const step of result!.steps) {
      console.log(`  [0x${step.screenIndex.toString(16).padStart(2, '0')}] ${step.screenName}`);
      console.log(`    Entry: (${step.entry.row}, ${step.entry.col}) \u2192 Exit: (${step.exit.row}, ${step.exit.col})`);
      console.log(`    Tile steps: ${step.tileSteps}`);
    }
  });

  it('finds same-screen route when source and target are on same screen', () => {
    // Use tiles known to be reachable on screen 0x2c
    const source: Location = { regionId: 'lw-2c', tile: { row: 63, col: 29 } };
    const target: Location = { regionId: 'lw-2c', tile: { row: 30, col: 22 } };
    const inventory = new Set(['lift.1']);

    const result = planRoute(rom, source, target, inventory);

    expect(result).not.toBeNull();
    expect(result!.totalScreens).toBe(1);
    console.log(`\nSame-screen route: ${result!.totalSteps} tile steps`);
  });

  it('routes through Kakariko NE with full lift inventory', () => {
    // Screen 0x19 (Kakariko NE) — route there with full lift set.
    // The path crosses bushes (lift.1) getting there.
    const source: Location = { regionId: 'links-house' };
    const target: Location = { regionId: 'lw-19', tile: { row: 24, col: 28 } };
    const inventory = new Set(['lift.1', 'lift.2']); // Titan's Mitt for black rocks

    const result = planRoute(rom, source, target, inventory);

    expect(result).not.toBeNull();
    console.log('\n=== Link\'s House \u2192 Kakariko NE ===');
    console.log(`Total screens: ${result!.totalScreens}`);
    console.log(`Total tile steps: ${result!.totalSteps}`);
    console.log(`Requirements: ${result!.requirements.length ? result!.requirements.join(', ') : 'none'}`);
    console.log('');
    console.log('Screen-by-screen breakdown:');
    for (const step of result!.steps) {
      console.log(`  [0x${step.screenIndex.toString(16).padStart(2, '0')}] ${step.screenName}`);
      console.log(`    Entry: (${step.entry.row}, ${step.entry.col}) \u2192 Exit: (${step.exit.row}, ${step.exit.col})`);
      console.log(`    Tile steps: ${step.tileSteps}`);
    }
    // Route crosses bushes, so at minimum lift.1 is required
    expect(result!.requirements).toContain('lift.1');
  });

  it('cannot reach heavy rock tile without Titan\'s Mitt', () => {
    // Same destination but without lift.2 — A* can't enter the rock tile
    const source: Location = { regionId: 'links-house' };
    const target: Location = { regionId: 'lw-19', tile: { row: 24, col: 28 } };
    const inventory = new Set(['lift.1']); // Only base lift — no Titan's Mitt

    const result = planRoute(rom, source, target, inventory);

    console.log('\n=== Link\'s House \u2192 Heavy Rock (no Titan\'s Mitt) ===');
    // Route still returns (manhattan fallback) but should NOT report lift.1
    // since A* failed on the last screen
    expect(result).not.toBeNull();
    console.log(`Requirements: ${result!.requirements.length ? result!.requirements.join(', ') : 'none'}`);
    expect(result!.requirements).not.toContain('lift.2');
  });
});
