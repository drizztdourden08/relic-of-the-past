/**
 * Tracker LIVE integration tests — runs the real game WASM, writes to actual
 * save_dung_info memory to simulate chest opens, polls the tracker, and verifies
 * the tracker state matches expectations.
 *
 * This is NOT a mock — it uses the real WASM module's HEAPU8 and ccall.
 */
import { test, expect } from '@playwright/test';
import { existsSync } from 'fs';
import {
  launchApp,
  clearAppData,
  seedSingleProfile,
  startGameFromProfile,
  getLogEntries,
  printLogs,
  TEST_ROMS,
} from './helpers';
import type { ElectronApplication, Page } from 'playwright';

// ─── Check definitions: checkId → { roomId, chestIndex } ───
// Mirrors shared/data/checks/room-flags.ts — duplicated here so tests are self-contained.

const CHEST_OPEN_MASKS = [0x100, 0x200, 0x400, 0x800, 0x1000, 0x2000];

interface CheckDef {
  roomId: number;
  chestIndex: number;
}

// Checks we'll test — 3+ from each category
const TEST_CHECKS: Record<string, CheckDef> = {
  // ─── Overworld / Link's House ───
  "Link's House":                          { roomId: 0x104, chestIndex: 0 },
  // ─── Escape / Sewers ───
  'Secret Passage':                        { roomId: 0x55,  chestIndex: 0 },
  'Hyrule Castle - Boomerang Chest':       { roomId: 0x71,  chestIndex: 0 },
  'Hyrule Castle - Map Chest':             { roomId: 0x72,  chestIndex: 0 },
  "Hyrule Castle - Zelda's Chest":         { roomId: 0x80,  chestIndex: 0 },
  'Sewers - Dark Cross':                   { roomId: 0x32,  chestIndex: 0 },
  // ─── Multi-chest room (Sewers Secret Room, room 0x11) ───
  'Sewers - Secret Room - Left':           { roomId: 0x11,  chestIndex: 0 },
  'Sewers - Secret Room - Middle':         { roomId: 0x11,  chestIndex: 1 },
  'Sewers - Secret Room - Right':          { roomId: 0x11,  chestIndex: 2 },
  'Sanctuary':                             { roomId: 0x12,  chestIndex: 0 },
  // ─── Eastern Palace ───
  'Eastern Palace - Compass Chest':        { roomId: 0xa8,  chestIndex: 0 },
  'Eastern Palace - Big Chest':            { roomId: 0xa9,  chestIndex: 0 },
  'Eastern Palace - Map Chest':            { roomId: 0xaa,  chestIndex: 0 },
  // ─── Desert Palace ───
  'Desert Palace - Map Chest':             { roomId: 0x74,  chestIndex: 0 },
  'Desert Palace - Compass Chest':         { roomId: 0x85,  chestIndex: 0 },
  'Desert Palace - Big Chest':             { roomId: 0x73,  chestIndex: 0 },
  // ─── Dark World dungeons (3 different dungeons) ───
  'Palace of Darkness - Shooter Room':     { roomId: 0x09,  chestIndex: 0 },
  'Swamp Palace - Entrance':               { roomId: 0x28,  chestIndex: 0 },
  'Skull Woods - Map Chest':               { roomId: 0x58,  chestIndex: 0 },
};

let app: ElectronApplication;
let window: Page;

test.beforeAll(async () => {
  test.skip(!existsSync(TEST_ROMS.usa), 'Test ROM not available');

  await clearAppData();

  // Seed a profile
  const { app: seedApp, window: seedWindow } = await launchApp({ muted: true });
  await seedSingleProfile(seedWindow, TEST_ROMS.usa, 'TrackerLive');
  await seedApp.close();

  // Relaunch and start the game
  ({ app, window } = await launchApp({ muted: true }));
  await window.waitForTimeout(3000);
  await startGameFromProfile(window, 20_000);
  // Let game fully initialize
  await window.waitForTimeout(4000);

  // Verify game is running and module is accessible
  const status = await window.evaluate(() => {
    const mod = (window as any).__zelda3Module;
    return {
      hasModule: !!mod,
      hasHEAPU8: !!(mod?.HEAPU8),
      hasCcall: typeof mod?.ccall === 'function',
    };
  });
  expect(status.hasModule).toBe(true);
  expect(status.hasHEAPU8).toBe(true);
  expect(status.hasCcall).toBe(true);
});

test.afterAll(async () => {
  await app?.close();
});

// ─── Helpers ───

/** Write a chest-open bit directly into the real WASM save_dung_info memory */
async function openChestInWasm(w: Page, roomId: number, chestIndex: number): Promise<void> {
  await w.evaluate(({ roomId, chestIndex, masks }) => {
    const mod = (window as any).__zelda3Module;
    const ptr = mod.ccall('WasmGetRoomFlags', 'number', [], []);
    const heap = mod.HEAPU8 as Uint8Array;
    const offset = ptr + roomId * 2;
    let flags = heap[offset] | (heap[offset + 1] << 8);
    flags |= masks[chestIndex];
    heap[offset] = flags & 0xFF;
    heap[offset + 1] = (flags >> 8) & 0xFF;
  }, { roomId, chestIndex, masks: CHEST_OPEN_MASKS });
}

/** Clear a chest-open bit in the real WASM save_dung_info memory */
async function closeChestInWasm(w: Page, roomId: number, chestIndex: number): Promise<void> {
  await w.evaluate(({ roomId, chestIndex, masks }) => {
    const mod = (window as any).__zelda3Module;
    const ptr = mod.ccall('WasmGetRoomFlags', 'number', [], []);
    const heap = mod.HEAPU8 as Uint8Array;
    const offset = ptr + roomId * 2;
    let flags = heap[offset] | (heap[offset + 1] << 8);
    flags &= ~masks[chestIndex];
    heap[offset] = flags & 0xFF;
    heap[offset + 1] = (flags >> 8) & 0xFF;
  }, { roomId, chestIndex, masks: CHEST_OPEN_MASKS });
}

/** Clear ALL room flags in WASM memory (reset all chests) */
async function clearAllRoomFlags(w: Page): Promise<void> {
  await w.evaluate(() => {
    const mod = (window as any).__zelda3Module;
    const ptr = mod.ccall('WasmGetRoomFlags', 'number', [], []);
    const heap = mod.HEAPU8 as Uint8Array;
    // save_dung_info = 320 × uint16 = 640 bytes
    for (let i = 0; i < 640; i++) {
      heap[ptr + i] = 0;
    }
  });
}

/** Force-poll the tracker bridge to update from current WASM memory */
async function forcePoll(w: Page): Promise<void> {
  await w.evaluate(() => {
    (window as any).__trackerBridge.pollInventoryState(true);
  });
}

/** Get the current completed checks from the tracker bridge */
async function getCompletedChecks(w: Page): Promise<string[]> {
  return w.evaluate(() => {
    return [...(window as any).__trackerBridge.getCompletedChecks()].sort();
  });
}

/** Read raw room flags from WASM memory for a specific room */
async function readRoomFlags(w: Page, roomId: number): Promise<number> {
  return w.evaluate(({ roomId }) => {
    const mod = (window as any).__zelda3Module;
    const ptr = mod.ccall('WasmGetRoomFlags', 'number', [], []);
    const heap = mod.HEAPU8 as Uint8Array;
    const offset = ptr + roomId * 2;
    return heap[offset] | (heap[offset + 1] << 8);
  }, { roomId });
}

// ─── Tests ───

test.describe('Tracker Live WASM', () => {

  test.beforeEach(async () => {
    // Clear all room flags before each test so tests are independent
    await clearAllRoomFlags(window);
    await forcePoll(window);
    const checks = await getCompletedChecks(window);
    expect(checks).toEqual([]);
  });

  test('WasmGetRoomFlags returns valid pointer', async () => {
    const ptr = await window.evaluate(() => {
      const mod = (window as any).__zelda3Module;
      return mod.ccall('WasmGetRoomFlags', 'number', [], []);
    });
    expect(ptr).toBeGreaterThan(0);
  });

  test("Link's House chest (room 0x104) triggers tracker", async () => {
    const def = TEST_CHECKS["Link's House"];
    await openChestInWasm(window, def.roomId, def.chestIndex);
    await forcePoll(window);

    const checks = await getCompletedChecks(window);
    expect(checks).toContain("Link's House");
  });

  test('Secret Passage chest (room 0x55) triggers tracker', async () => {
    const def = TEST_CHECKS['Secret Passage'];
    await openChestInWasm(window, def.roomId, def.chestIndex);
    await forcePoll(window);

    const checks = await getCompletedChecks(window);
    expect(checks).toContain('Secret Passage');
  });

  test('Hyrule Castle - Map Chest (room 0x72) triggers tracker', async () => {
    const def = TEST_CHECKS['Hyrule Castle - Map Chest'];
    await openChestInWasm(window, def.roomId, def.chestIndex);
    await forcePoll(window);

    const checks = await getCompletedChecks(window);
    expect(checks).toContain('Hyrule Castle - Map Chest');
  });

  test('3 Escape/Sewers checks all trigger correctly', async () => {
    const escapeChecks = [
      'Secret Passage',
      'Hyrule Castle - Boomerang Chest',
      'Sewers - Dark Cross',
    ];

    for (const checkId of escapeChecks) {
      const def = TEST_CHECKS[checkId];
      await openChestInWasm(window, def.roomId, def.chestIndex);
    }
    await forcePoll(window);

    const checks = await getCompletedChecks(window);
    for (const checkId of escapeChecks) {
      expect(checks).toContain(checkId);
    }
  });

  test('3 Eastern Palace checks all trigger correctly', async () => {
    const epChecks = [
      'Eastern Palace - Compass Chest',
      'Eastern Palace - Big Chest',
      'Eastern Palace - Map Chest',
    ];

    for (const checkId of epChecks) {
      const def = TEST_CHECKS[checkId];
      await openChestInWasm(window, def.roomId, def.chestIndex);
    }
    await forcePoll(window);

    const checks = await getCompletedChecks(window);
    for (const checkId of epChecks) {
      expect(checks).toContain(checkId);
    }
  });

  test('3 Desert Palace checks all trigger correctly', async () => {
    const dpChecks = [
      'Desert Palace - Map Chest',
      'Desert Palace - Compass Chest',
      'Desert Palace - Big Chest',
    ];

    for (const checkId of dpChecks) {
      const def = TEST_CHECKS[checkId];
      await openChestInWasm(window, def.roomId, def.chestIndex);
    }
    await forcePoll(window);

    const checks = await getCompletedChecks(window);
    for (const checkId of dpChecks) {
      expect(checks).toContain(checkId);
    }
  });

  test('3 Dark World dungeon checks all trigger correctly', async () => {
    const dwChecks = [
      'Palace of Darkness - Shooter Room',
      'Swamp Palace - Entrance',
      'Skull Woods - Map Chest',
    ];

    for (const checkId of dwChecks) {
      const def = TEST_CHECKS[checkId];
      await openChestInWasm(window, def.roomId, def.chestIndex);
    }
    await forcePoll(window);

    const checks = await getCompletedChecks(window);
    for (const checkId of dwChecks) {
      expect(checks).toContain(checkId);
    }
  });

  test('multi-chest room: 3 Sewers Secret Room chests tracked independently', async () => {
    // Open left and right, but NOT middle
    await openChestInWasm(window, 0x11, 0); // Left
    await openChestInWasm(window, 0x11, 2); // Right
    await forcePoll(window);

    let checks = await getCompletedChecks(window);
    expect(checks).toContain('Sewers - Secret Room - Left');
    expect(checks).toContain('Sewers - Secret Room - Right');
    expect(checks).not.toContain('Sewers - Secret Room - Middle');

    // Now open middle
    await openChestInWasm(window, 0x11, 1); // Middle
    await forcePoll(window);

    checks = await getCompletedChecks(window);
    expect(checks).toContain('Sewers - Secret Room - Left');
    expect(checks).toContain('Sewers - Secret Room - Middle');
    expect(checks).toContain('Sewers - Secret Room - Right');

    // Close left — others remain
    await closeChestInWasm(window, 0x11, 0);
    await forcePoll(window);

    checks = await getCompletedChecks(window);
    expect(checks).not.toContain('Sewers - Secret Room - Left');
    expect(checks).toContain('Sewers - Secret Room - Middle');
    expect(checks).toContain('Sewers - Secret Room - Right');
  });

  test('closing a chest clears it from tracker', async () => {
    const def = TEST_CHECKS["Hyrule Castle - Zelda's Chest"];
    await openChestInWasm(window, def.roomId, def.chestIndex);
    await forcePoll(window);

    let checks = await getCompletedChecks(window);
    expect(checks).toContain("Hyrule Castle - Zelda's Chest");

    await closeChestInWasm(window, def.roomId, def.chestIndex);
    await forcePoll(window);

    checks = await getCompletedChecks(window);
    expect(checks).not.toContain("Hyrule Castle - Zelda's Chest");
  });

  test('opening all test checks at once produces correct count', async () => {
    for (const [, def] of Object.entries(TEST_CHECKS)) {
      await openChestInWasm(window, def.roomId, def.chestIndex);
    }
    await forcePoll(window);

    const checks = await getCompletedChecks(window);
    // Verify every test check is present
    for (const checkId of Object.keys(TEST_CHECKS)) {
      expect(checks).toContain(checkId);
    }
    // Should be at least as many as our test checks (could be more if the
    // game's save_dung_info has other bits set from initialization)
    expect(checks.length).toBeGreaterThanOrEqual(Object.keys(TEST_CHECKS).length);
  });

  test('WASM memory writes are reflected in raw flag reads', async () => {
    // Verify we can read back what we wrote
    const roomId = 0x55; // Secret Passage
    let flags = await readRoomFlags(window, roomId);
    expect(flags & 0x100).toBe(0); // Not set initially

    await openChestInWasm(window, roomId, 0);
    flags = await readRoomFlags(window, roomId);
    expect(flags & 0x100).toBe(0x100); // Now set

    await closeChestInWasm(window, roomId, 0);
    flags = await readRoomFlags(window, roomId);
    expect(flags & 0x100).toBe(0); // Cleared again
  });

  test('clear all + poll produces empty tracker', async () => {
    // Open several chests
    await openChestInWasm(window, 0x104, 0); // Link's House
    await openChestInWasm(window, 0x55, 0);  // Secret Passage
    await openChestInWasm(window, 0xa8, 0);  // EP Compass
    await forcePoll(window);

    let checks = await getCompletedChecks(window);
    expect(checks.length).toBeGreaterThan(0);

    // Clear everything
    await clearAllRoomFlags(window);
    await forcePoll(window);

    checks = await getCompletedChecks(window);
    expect(checks).toEqual([]);
  });
});
