/**
 * Tracker Debug Mock — simulates WASM memory for testing the tracker
 * without running the game. Injects a mock EmscriptenModule with a fake
 * HEAPU8 buffer, then exposes `window.__trackerDebug` for controlling it.
 *
 * Usage (dev console):
 *   __trackerDebug.enable()
 *   __trackerDebug.openChest('Secret Passage')
 *   __trackerDebug.openChest('Hyrule Castle - Map Chest')
 *   __trackerDebug.addItem('Lamp')
 *   __trackerDebug.poll()              // force update tracker
 *   __trackerDebug.state()             // see current state
 *   __trackerDebug.closeChest('Secret Passage')
 *   __trackerDebug.poll()              // tracker should show it unchecked
 *   __trackerDebug.reset()             // clear everything
 *   __trackerDebug.disable()           // restore real module
 */

import { getModule, setModule } from '../wasm-bridge';
import type { EmscriptenModule } from '../types';
import { CHECK_ROOM_FLAGS, CHEST_OPEN_MASKS } from '@shared/game/checks/flags/room';
import { pollInventoryState, getCurrentInventory, getCompletedChecks } from './bridge';
import { log } from '../../log-bus';

// ─── Memory layout ───
// We allocate a contiguous buffer and assign fixed offsets for each region.
// The mock ccall returns these offsets as "pointers".

const INVENTORY_OFFSET = 1024;    // 34 bytes — must be non-zero (used as ptr, 0 is falsy)
const INVENTORY_SIZE = 34;
const ROOM_FLAGS_OFFSET = 2048;   // 320 × 2 = 640 bytes (uint16[320]) — also non-zero
const ROOM_FLAGS_SIZE = 640;
const BUFFER_SIZE = ROOM_FLAGS_OFFSET + ROOM_FLAGS_SIZE; // 2688 bytes

// ─── Inventory byte positions (must match parseInventoryBuffer) ───

const INVENTORY_SLOTS: Record<string, { offset: number; value: number }> = {
  // Bow
  'Bow':              { offset: 0, value: 1 },
  'Silver Bow':       { offset: 0, value: 3 },
  // Boomerang
  'Blue Boomerang':   { offset: 1, value: 1 },
  'Red Boomerang':    { offset: 1, value: 2 },
  // Simple flags (byte = 1 when owned)
  'Hookshot':         { offset: 2, value: 1 },
  'Bombs':            { offset: 3, value: 1 },
  'Mushroom':         { offset: 4, value: 1 },
  'Magic Powder':     { offset: 4, value: 2 },
  'Fire Rod':         { offset: 5, value: 1 },
  'Ice Rod':          { offset: 6, value: 1 },
  'Bombos':           { offset: 7, value: 1 },
  'Ether':            { offset: 8, value: 1 },
  'Quake':            { offset: 9, value: 1 },
  'Lamp':             { offset: 10, value: 1 },
  'Hammer':           { offset: 11, value: 1 },
  // Flute/Shovel
  'Shovel':           { offset: 12, value: 1 },
  'Flute':            { offset: 12, value: 2 },
  'Activated Flute':  { offset: 12, value: 3 },
  // More flags
  'Bug Catching Net': { offset: 13, value: 1 },
  'Book of Mudora':   { offset: 14, value: 1 },
  'Cane of Somaria':  { offset: 15, value: 1 },
  'Cane of Byrna':    { offset: 16, value: 1 },
  'Cape':             { offset: 17, value: 1 },
  'Magic Mirror':     { offset: 18, value: 2 },
  // Gloves
  'Power Glove':      { offset: 19, value: 1 },
  'Titans Mitts':     { offset: 19, value: 2 },
  // More flags
  'Pegasus Boots':    { offset: 20, value: 1 },
  'Flippers':         { offset: 21, value: 1 },
  'Moon Pearl':       { offset: 22, value: 1 },
  // Sword progression
  'Fighter Sword':    { offset: 23, value: 1 },
  'Master Sword':     { offset: 23, value: 2 },
  'Tempered Sword':   { offset: 23, value: 3 },
  'Golden Sword':     { offset: 23, value: 4 },
  // Shield progression
  'Fighters Shield':  { offset: 24, value: 1 },
  'Fire Shield':      { offset: 24, value: 2 },
  'Mirror Shield':    { offset: 24, value: 3 },
  // Armor
  'Blue Mail':        { offset: 25, value: 1 },
  'Red Mail':         { offset: 25, value: 2 },
  // Bottles
  'Bottle':           { offset: 26, value: 2 },
  // Pendants (bitmask at offset 30)
  'Green Pendant':    { offset: 30, value: 0x04 },
  'Red Pendant':      { offset: 30, value: 0x01 },
  'Blue Pendant':     { offset: 30, value: 0x02 },
};

// Pendants and crystals are bitmasks — addItem needs to OR instead of set
const BITMASK_OFFSETS = new Set([30, 31]);

// ─── Mock state ───

let mockBuffer: Uint8Array | null = null;
let savedModule: EmscriptenModule | null = null;
let enabled = false;

function ensureBuffer(): Uint8Array {
  if (!mockBuffer) {
    mockBuffer = new Uint8Array(BUFFER_SIZE);
  }
  return mockBuffer;
}

function createMockModule(): EmscriptenModule & { HEAPU8: Uint8Array } {
  const buf = ensureBuffer();
  return {
    HEAPU8: buf,
    FS: {
      writeFile() { /* no-op */ },
      mkdir() { /* no-op */ },
      readdir() { return []; },
      readFile() { return new Uint8Array(0); },
      analyzePath() { return { exists: false }; },
    },
    ccall(ident: string, _returnType: string | null, _argTypes: string[], _args: unknown[]): unknown {
      if (ident === 'WasmGetInventoryState') return INVENTORY_OFFSET;
      if (ident === 'WasmGetRoomFlags') return ROOM_FLAGS_OFFSET;
      return 0;
    },
  };
}

// ─── Debug API ───

const debugApi = {
  /** Activate mock mode — saves the real module and injects the mock */
  enable(): string {
    if (enabled) return 'Already enabled';
    savedModule = getModule();
    const mock = createMockModule();
    setModule(mock as any);
    enabled = true;
    log.app('[TrackerDebug] Mock enabled');
    return 'Mock enabled. Use openChest(), addItem(), poll(), state(), etc.';
  },

  /** Deactivate mock mode — restores the real WASM module */
  disable(): string {
    if (!enabled) return 'Not enabled';
    setModule(savedModule);
    savedModule = null;
    enabled = false;
    mockBuffer = null;
    log.app('[TrackerDebug] Mock disabled');
    return 'Mock disabled, real module restored.';
  },

  /** Mark a chest check as opened by setting the room flag bit */
  openChest(checkId: string): string {
    if (!enabled) return 'Call enable() first';
    const entry = CHECK_ROOM_FLAGS[checkId];
    if (!entry) return `Unknown check: "${checkId}". Use listChecks() to see valid IDs.`;
    const buf = ensureBuffer();
    const byteOffset = ROOM_FLAGS_OFFSET + entry.roomId * 2;
    const mask = CHEST_OPEN_MASKS[entry.chestIndex];
    // Read current uint16 (little-endian), set bit, write back
    let flags = buf[byteOffset] | (buf[byteOffset + 1] << 8);
    flags |= mask;
    buf[byteOffset] = flags & 0xFF;
    buf[byteOffset + 1] = (flags >> 8) & 0xFF;
    log.app(`[TrackerDebug] Opened chest: ${checkId} (room=0x${entry.roomId.toString(16)}, bit=0x${mask.toString(16)})`);
    return `Opened: ${checkId}. Call poll() to update tracker.`;
  },

  /** Mark a chest check as closed by clearing the room flag bit */
  closeChest(checkId: string): string {
    if (!enabled) return 'Call enable() first';
    const entry = CHECK_ROOM_FLAGS[checkId];
    if (!entry) return `Unknown check: "${checkId}". Use listChecks() to see valid IDs.`;
    const buf = ensureBuffer();
    const byteOffset = ROOM_FLAGS_OFFSET + entry.roomId * 2;
    const mask = CHEST_OPEN_MASKS[entry.chestIndex];
    let flags = buf[byteOffset] | (buf[byteOffset + 1] << 8);
    flags &= ~mask;
    buf[byteOffset] = flags & 0xFF;
    buf[byteOffset + 1] = (flags >> 8) & 0xFF;
    log.app(`[TrackerDebug] Closed chest: ${checkId}`);
    return `Closed: ${checkId}. Call poll() to update tracker.`;
  },

  /** Add an item to the mock inventory buffer */
  addItem(itemName: string): string {
    if (!enabled) return 'Call enable() first';
    const slot = INVENTORY_SLOTS[itemName];
    if (!slot) return `Unknown item: "${itemName}". Use listItems() to see valid names.`;
    const buf = ensureBuffer();
    const pos = INVENTORY_OFFSET + slot.offset;
    if (BITMASK_OFFSETS.has(slot.offset)) {
      buf[pos] |= slot.value; // OR for bitmask fields
    } else {
      buf[pos] = slot.value;
    }
    log.app(`[TrackerDebug] Added item: ${itemName}`);
    return `Added: ${itemName}. Call poll() to update tracker.`;
  },

  /** Remove an item from the mock inventory buffer */
  removeItem(itemName: string): string {
    if (!enabled) return 'Call enable() first';
    const slot = INVENTORY_SLOTS[itemName];
    if (!slot) return `Unknown item: "${itemName}". Use listItems() to see valid names.`;
    const buf = ensureBuffer();
    const pos = INVENTORY_OFFSET + slot.offset;
    if (BITMASK_OFFSETS.has(slot.offset)) {
      buf[pos] &= ~slot.value; // Clear bit for bitmask fields
    } else {
      buf[pos] = 0;
    }
    log.app(`[TrackerDebug] Removed item: ${itemName}`);
    return `Removed: ${itemName}. Call poll() to update tracker.`;
  },

  /** Force-poll to update the tracker from mock state */
  poll(): string {
    if (!enabled) return 'Call enable() first';
    pollInventoryState(true);
    return 'Polled. Tracker should be updated.';
  },

  /** Reset all mock state (clear all chests and inventory) */
  reset(): string {
    if (!enabled) return 'Call enable() first';
    ensureBuffer().fill(0);
    log.app('[TrackerDebug] Reset all mock state');
    return 'All mock state cleared. Call poll() to update tracker.';
  },

  /** Get current tracker state as a plain object */
  state(): { enabled: boolean; inventory: string[]; completedChecks: string[] } {
    return {
      enabled,
      inventory: [...getCurrentInventory()].sort(),
      completedChecks: [...getCompletedChecks()].sort(),
    };
  },

  /** List all valid check IDs for openChest/closeChest */
  listChecks(): string[] {
    return Object.keys(CHECK_ROOM_FLAGS).sort();
  },

  /** List all valid item names for addItem/removeItem */
  listItems(): string[] {
    return Object.keys(INVENTORY_SLOTS).sort();
  },

  /** Run a scripted test scenario */
  runScenario(name?: string): string {
    if (!enabled) this.enable();

    if (!name || name === 'escape') {
      // Simulate the Escape sequence: uncle gives sword, pick up lamp, open secret passage, map chest
      this.reset();
      this.addItem('Fighter Sword');
      this.addItem('Fighters Shield');
      this.addItem('Lamp');
      this.openChest("Link's House");
      this.openChest('Secret Passage');
      this.openChest('Hyrule Castle - Map Chest');
      this.openChest('Hyrule Castle - Boomerang Chest');
      this.poll();
      return 'Scenario "escape" applied. Check tracker for 4 completed checks + sword/shield/lamp.';
    }

    if (name === 'early-game') {
      // Simulate getting through Eastern Palace
      this.reset();
      this.addItem('Fighter Sword');
      this.addItem('Fighters Shield');
      this.addItem('Lamp');
      this.addItem('Bow');
      this.addItem('Power Glove');
      this.openChest("Link's House");
      this.openChest('Secret Passage');
      this.openChest('Hyrule Castle - Map Chest');
      this.openChest('Hyrule Castle - Boomerang Chest');
      this.openChest("Hyrule Castle - Zelda's Chest");
      this.openChest('Sanctuary');
      this.openChest('Eastern Palace - Compass Chest');
      this.openChest('Eastern Palace - Big Chest');
      this.openChest('Eastern Palace - Big Key Chest');
      this.openChest('Eastern Palace - Map Chest');
      this.openChest('Eastern Palace - Cannonball Chest');
      this.addItem('Green Pendant');
      this.poll();
      return 'Scenario "early-game" applied. Check tracker for Escape + Eastern completion.';
    }

    if (name === 'save-load') {
      // Simulate opening chests, then "loading a save state" (reset room flags)
      this.reset();
      this.addItem('Fighter Sword');
      this.addItem('Lamp');
      this.openChest('Secret Passage');
      this.openChest('Hyrule Castle - Map Chest');
      this.poll();
      const before = this.state();
      // Now simulate save state load — clear room flags but keep inventory
      const buf = ensureBuffer();
      // Clear only room flags region
      buf.fill(0, ROOM_FLAGS_OFFSET, ROOM_FLAGS_OFFSET + ROOM_FLAGS_SIZE);
      this.poll();
      const after = this.state();
      log.app(`[TrackerDebug] save-load scenario: before=${before.completedChecks.length} checks, after=${after.completedChecks.length} checks`);
      return `Scenario "save-load": ${before.completedChecks.length} checks → ${after.completedChecks.length} checks. Inventory preserved (${after.inventory.length} items).`;
    }

    return `Unknown scenario "${name}". Available: escape, early-game, save-load`;
  },
};

/** Install the debug API on window (dev mode only) */
export function installTrackerDebug(): void {
  (window as any).__trackerDebug = debugApi;
  log.app('[TrackerDebug] Debug API installed. Use window.__trackerDebug in console.');
}
