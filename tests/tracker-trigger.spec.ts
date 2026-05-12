/**
 * Tracker Check Trigger — dynamic end-to-end test.
 *
 * Configure the check to test via the SCENARIO object below.
 * Launch the app, load a save state, trigger a check, and verify:
 *   1. Visual change on screen (before/after screenshots)
 *   2. Tracker summary (done/available/blocked) updates
 *   3. Tracker inventory shows expected items
 *   4. Tracker checklist marks the check as completed
 *   5. Game logs contain the correct notifications
 *
 * Usage: Edit the SCENARIO below, then run:
 *   npx playwright test tracker-trigger.spec.ts --reporter=list
 */
import { test, expect } from '@playwright/test';
import {
  launchApp,
  startGameFromProfile,
  getLogEntries,
  printLogs,
  screenshot,
} from './helpers';
import type { ElectronApplication, Page } from 'playwright';

// ═══════════════════════════════════════════════════════════════
// ✏️  EDIT THIS SCENARIO TO TEST A DIFFERENT CHECK
// ═══════════════════════════════════════════════════════════════
const SCENARIO = {
  /** Human-readable name for test output */
  name: "Link's Uncle",

  /** Save state slot to load (1 = F2, 2 = F3, etc.) */
  saveSlot: 1,

  /** Check type: 'chest' or 'npc' */
  type: 'npc' as 'chest' | 'npc',

  // ── For chest checks ──
  /** Room ID (hex) for chest checks */
  roomId: 0x000,
  /** Chest index (0-5) */
  chestIndex: 0,

  // ── For NPC checks ──
  /** Flag type: 0=sram_progress_flags, 1=sram_progress_indicator, 2=sram_progress_indicator_3 */
  flagType: 0,
  /** Bit mask to set in the flag byte */
  flagMask: 0x01,
  /** Sprite type to transition (0xFF = none). Uncle = 0x73 */
  spriteType: 0x73,
  /** Post-check sprite_graphics value. Uncle = 1 (lying down without weapons) */
  postGfx: 1,

  /** Item ID to give (from ITEM_ID_TO_NAME) */
  itemId: 0x00,  // Fighter Sword (also auto-grants Fighter's Shield)

  /** Check ID as it appears in the tracker data */
  checkId: "Link's Uncle",

  /** Region name in the tracker that contains this check */
  regionName: 'Hyrule Castle Secret Entrance',

  /** Expected items in tracker inventory AFTER the trigger */
  expectedItems: ['Fighter Sword', 'Fighters Shield'],

  /** Log patterns to verify */
  logPatterns: {
    trigger: 'TriggerNpcCheck: sram_progress_flags',
    received: 'Item received: Fighter Sword',
  },
};
// ═══════════════════════════════════════════════════════════════

const saveSlotKey = `F${SCENARIO.saveSlot + 1}`;  // slot 1 = F2, slot 2 = F3

let app: ElectronApplication;
let window: Page;

test.beforeAll(async () => {
  ({ app, window } = await launchApp({ muted: true }));
  await window.waitForTimeout(3000);
  await startGameFromProfile(window, 25_000);
  await window.waitForTimeout(5000);

  const running = await window.evaluate(() => {
    const mod = (window as any).__zelda3Module;
    return !!mod && typeof mod.ccall === 'function';
  });
  expect(running).toBe(true);

  // Load save state
  await window.keyboard.press(saveSlotKey);
  await window.waitForTimeout(3000);
});

test.afterAll(async () => {
  if (app) {
    const logs = await getLogEntries(window);
    printLogs(logs);
    await app.close();
  }
});

// ─── Helpers ───

async function triggerChestCheck(w: Page, roomId: number, chestIndex: number, itemId: number): Promise<void> {
  await w.evaluate(({ roomId, chestIndex, itemId }) => {
    const mod = (window as any).__zelda3Module;
    mod.ccall('WasmTriggerCheck', null, ['number', 'number', 'number'], [roomId, chestIndex, itemId]);
  }, { roomId, chestIndex, itemId });
}

async function triggerNpcCheck(w: Page, flagType: number, flagMask: number, itemId: number, spriteType: number, postGfx: number): Promise<void> {
  await w.evaluate(({ flagType, flagMask, itemId, spriteType, postGfx }) => {
    const mod = (window as any).__zelda3Module;
    mod.ccall('WasmTriggerNpcCheck', null, ['number', 'number', 'number', 'number', 'number'], [flagType, flagMask, itemId, spriteType, postGfx]);
  }, { flagType, flagMask, itemId, spriteType, postGfx });
}

async function triggerScenario(w: Page): Promise<void> {
  if (SCENARIO.type === 'chest') {
    await triggerChestCheck(w, SCENARIO.roomId, SCENARIO.chestIndex, SCENARIO.itemId);
  } else {
    await triggerNpcCheck(w, SCENARIO.flagType, SCENARIO.flagMask, SCENARIO.itemId, SCENARIO.spriteType, SCENARIO.postGfx);
  }
}

async function forcePoll(w: Page): Promise<void> {
  await w.evaluate(() => (window as any).__trackerBridge.pollInventoryState(true));
}

async function getCompletedChecks(w: Page): Promise<string[]> {
  return w.evaluate(() => [...(window as any).__trackerBridge.getCompletedChecks()].sort());
}

async function getInventory(w: Page): Promise<string[]> {
  return w.evaluate(() => [...(window as any).__trackerBridge.getCurrentInventory()].sort());
}

async function openTracker(w: Page): Promise<void> {
  await w.click('[aria-label="Menu"]');
  await w.waitForTimeout(300);
  await w.locator('.dropdown__item', { hasText: 'Tracker' }).click();
  await w.waitForTimeout(500);
  await w.waitForSelector('.tracker-view', { timeout: 3000 });
}

async function readTrackerSummary(w: Page): Promise<{done: string; available: string; blocked: string; pct: string}> {
  return w.evaluate(() => {
    const stats = document.querySelectorAll('.tracker-summary__stat');
    return {
      done: stats[0]?.textContent?.trim() ?? '',
      available: stats[1]?.textContent?.trim() ?? '',
      blocked: stats[2]?.textContent?.trim() ?? '',
      pct: stats[3]?.textContent?.trim() ?? '',
    };
  });
}

async function readTrackerInventory(w: Page): Promise<string> {
  return w.evaluate(() => {
    const el = document.querySelector('.tracker-view__inventory-items');
    return el?.textContent?.trim() ?? '';
  });
}

async function readCheckStatus(w: Page, regionName: string, checkName: string): Promise<{icon: string; status: string} | null> {
  const regionHeader = w.locator('.tracker-region__header', { hasText: regionName });
  if (await regionHeader.count() === 0) return null;
  const chevron = await regionHeader.locator('.tracker-region__chevron').textContent();
  if (chevron === '▶') {
    await regionHeader.click();
    await w.waitForTimeout(300);
  }
  const checkRow = w.locator('.tracker-check', { hasText: checkName });
  if (await checkRow.count() === 0) return null;
  const icon = await checkRow.locator('.tracker-check__icon').textContent();
  const classList = await checkRow.getAttribute('class');
  const status = classList?.includes('--completed') ? 'completed'
    : classList?.includes('--reachable') ? 'reachable' : 'blocked';
  return { icon: icon?.trim() ?? '', status };
}

// ─── Tests ───

test.describe(`Check: ${SCENARIO.name}`, () => {

  test('BEFORE: screenshot + baseline', async () => {
    const tag = SCENARIO.name.replace(/[^a-zA-Z0-9]/g, '_');
    await screenshot(window, `${tag}-01-before`);
    await forcePoll(window);
    const checks = await getCompletedChecks(window);
    expect(checks).not.toContain(SCENARIO.checkId);
    for (const item of SCENARIO.expectedItems) {
      const inventory = await getInventory(window);
      expect(inventory).not.toContain(item);
    }
  });

  test('TRIGGER: give item and verify bridge', async () => {
    const tag = SCENARIO.name.replace(/[^a-zA-Z0-9]/g, '_');
    await triggerScenario(window);
    await window.waitForTimeout(2000);
    await screenshot(window, `${tag}-02-after`);
    await forcePoll(window);

    const checks = await getCompletedChecks(window);
    expect(checks).toContain(SCENARIO.checkId);

    const inventory = await getInventory(window);
    for (const item of SCENARIO.expectedItems) {
      expect(inventory).toContain(item);
    }
  });

  test('TRACKER: summary, inventory, checklist', async () => {
    const tag = SCENARIO.name.replace(/[^a-zA-Z0-9]/g, '_');
    await window.waitForTimeout(2000);
    await forcePoll(window);
    await openTracker(window);
    await window.waitForTimeout(500);
    await screenshot(window, `${tag}-03-tracker`);

    // Summary
    const summary = await readTrackerSummary(window);
    console.log(`Tracker Summary: ${summary.done} | ${summary.available} | ${summary.blocked} | ${summary.pct}`);
    expect(summary.done).toMatch(/^[1-9]\d* done$/);

    // Inventory
    const inventoryText = await readTrackerInventory(window);
    console.log(`Tracker Inventory: ${inventoryText}`);
    for (const item of SCENARIO.expectedItems) {
      expect(inventoryText).toContain(item);
    }

    // Region check
    const allRegions = await window.evaluate(() => {
      return Array.from(document.querySelectorAll('.tracker-region__header')).map(h => ({
        name: h.querySelector('.tracker-region__name')?.textContent?.trim() ?? '',
        counts: h.querySelector('.tracker-region__counts')?.textContent?.trim() ?? '',
      }));
    });
    console.log('Tracker Regions:');
    for (const r of allRegions) console.log(`  ${r.name}: ${r.counts}`);

    const check = await readCheckStatus(window, SCENARIO.regionName, SCENARIO.checkId);
    if (check) {
      console.log(`${SCENARIO.checkId} in "${SCENARIO.regionName}": icon=${check.icon} status=${check.status}`);
      expect(check.status).toBe('completed');
      expect(check.icon).toBe('✓');
    } else {
      console.log(`Could not find "${SCENARIO.checkId}" in region "${SCENARIO.regionName}"`);
      expect(check).not.toBeNull();
    }

    await screenshot(window, `${tag}-04-checklist`);
  });

  test('LOGS: verify notifications', async () => {
    const logs = await getLogEntries(window);
    const relevant = logs
      .filter(l => l.message.includes('[Tracker]') || l.message.includes('[GameHook]'))
      .map(l => l.message);
    console.log('Relevant logs:');
    for (const l of relevant) console.log(`  ${l}`);

    expect(relevant.find(l => l.includes(SCENARIO.logPatterns.trigger))).toBeDefined();
    expect(relevant.find(l => l.includes(SCENARIO.logPatterns.received))).toBeDefined();
  });
});
