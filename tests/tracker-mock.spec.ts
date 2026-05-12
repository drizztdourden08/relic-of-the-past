/**
 * Tracker integration tests using the debug mock.
 *
 * These tests exercise the full tracker pipeline:
 *   mock WASM buffer → bridge polling → listener notifications → state
 *
 * No ROM or game required — the debug mock simulates WASM memory.
 */
import { test, expect } from '@playwright/test';
import {
  launchApp,
  clearAppData,
  seedSingleProfile,
  getLogEntries,
  TEST_ROMS,
} from './helpers';
import type { ElectronApplication, Page } from 'playwright';

let app: ElectronApplication;
let window: Page;

test.beforeAll(async () => {
  await clearAppData();
  ({ app, window } = await launchApp({ muted: true }));
  await seedSingleProfile(window, TEST_ROMS.usa, 'TrackerTest');
  await app.close();
  ({ app, window } = await launchApp({ muted: true }));
  await window.waitForTimeout(5000);

  // Verify debug API is available
  const type = await window.evaluate('typeof window.__trackerDebug');
  if (type === 'undefined') throw new Error('Debug API not installed');
});

test.afterAll(async () => {
  await app?.close();
});

// ─── Helper: run debug commands in renderer ───

async function dbg(w: Page, expr: string): Promise<any> {
  return w.evaluate(`window.__trackerDebug.${expr}`);
}

async function dbgState(w: Page): Promise<{ enabled: boolean; inventory: string[]; completedChecks: string[] }> {
  return w.evaluate('window.__trackerDebug.state()');
}

/** Enable mock, reset, run body, then disable. */
async function withMock(w: Page, body: () => Promise<void>): Promise<void> {
  await dbg(w, 'enable()');
  await dbg(w, 'reset()');
  try {
    await body();
  } finally {
    await dbg(w, 'disable()');
  }
}

// ─── Tests ───

test.describe('Tracker Debug Mock', () => {

  test('debug API is available', async () => {
    const type = await window.evaluate('typeof window.__trackerDebug');
    expect(type).toBe('object');
  });

  test('enable injects mock and disable restores', async () => {
    const r1 = await dbg(window, 'enable()');
    expect(r1).toContain('Mock enabled');
    const s = await dbgState(window);
    expect(s.enabled).toBe(true);

    const r2 = await dbg(window, 'disable()');
    expect(r2).toContain('Mock disabled');
    const s2 = await dbgState(window);
    expect(s2.enabled).toBe(false);
  });

  test('openChest + poll marks check completed', async () => {
    await withMock(window, async () => {
      await dbg(window, "openChest('Secret Passage')");
      await dbg(window, 'poll()');

      const s = await dbgState(window);
      expect(s.completedChecks).toContain('Secret Passage');
      expect(s.completedChecks).toHaveLength(1);
    });
  });

  test('closeChest + poll removes completed check', async () => {
    await withMock(window, async () => {
      await dbg(window, "openChest('Secret Passage')");
      await dbg(window, 'poll()');
      let s = await dbgState(window);
      expect(s.completedChecks).toContain('Secret Passage');

      await dbg(window, "closeChest('Secret Passage')");
      await dbg(window, 'poll()');
      s = await dbgState(window);
      expect(s.completedChecks).not.toContain('Secret Passage');
      expect(s.completedChecks).toHaveLength(0);
    });
  });

  test('addItem + poll updates inventory', async () => {
    await withMock(window, async () => {
      await dbg(window, "addItem('Lamp')");
      await dbg(window, "addItem('Fighter Sword')");
      await dbg(window, 'poll()');

      const s = await dbgState(window);
      expect(s.inventory).toContain('Lamp');
      expect(s.inventory).toContain('Fighter Sword');
    });
  });

  test('removeItem + poll removes from inventory', async () => {
    await withMock(window, async () => {
      await dbg(window, "addItem('Lamp')");
      await dbg(window, "addItem('Fighter Sword')");
      await dbg(window, 'poll()');

      await dbg(window, "removeItem('Lamp')");
      await dbg(window, 'poll()');

      const s = await dbgState(window);
      expect(s.inventory).not.toContain('Lamp');
      expect(s.inventory).toContain('Fighter Sword');
    });
  });

  test('reset clears all state', async () => {
    await withMock(window, async () => {
      await dbg(window, "openChest('Hyrule Castle - Map Chest')");
      await dbg(window, "addItem('Lamp')");
      await dbg(window, 'poll()');
      let s = await dbgState(window);
      expect(s.completedChecks.length).toBeGreaterThan(0);
      expect(s.inventory.length).toBeGreaterThan(0);

      await dbg(window, 'reset()');
      await dbg(window, 'poll()');
      s = await dbgState(window);
      expect(s.completedChecks).toEqual([]);
      expect(s.inventory).toEqual([]);
    });
  });

  test('multiple chests in same room tracked independently', async () => {
    await withMock(window, async () => {
      // Sewers Secret Room: 3 chests in room 0x11
      await dbg(window, "openChest('Sewers - Secret Room - Left')");
      await dbg(window, "openChest('Sewers - Secret Room - Right')");
      await dbg(window, 'poll()');

      let s = await dbgState(window);
      expect(s.completedChecks).toContain('Sewers - Secret Room - Left');
      expect(s.completedChecks).toContain('Sewers - Secret Room - Right');
      expect(s.completedChecks).not.toContain('Sewers - Secret Room - Middle');

      await dbg(window, "openChest('Sewers - Secret Room - Middle')");
      await dbg(window, 'poll()');
      s = await dbgState(window);
      expect(s.completedChecks).toContain('Sewers - Secret Room - Middle');

      // Close just one — others remain
      await dbg(window, "closeChest('Sewers - Secret Room - Left')");
      await dbg(window, 'poll()');
      s = await dbgState(window);
      expect(s.completedChecks).not.toContain('Sewers - Secret Room - Left');
      expect(s.completedChecks).toContain('Sewers - Secret Room - Middle');
      expect(s.completedChecks).toContain('Sewers - Secret Room - Right');
    });
  });

  test('save-load scenario: room flags reset, inventory preserved', async () => {
    await withMock(window, async () => {
      const result = await dbg(window, "runScenario('save-load')");
      expect(result).toContain('0 checks');

      const s = await dbgState(window);
      expect(s.inventory).toContain('Fighter Sword');
      expect(s.inventory).toContain('Lamp');
      expect(s.completedChecks).toEqual([]);
    });
  });

  test('escape scenario populates expected state', async () => {
    await withMock(window, async () => {
      await dbg(window, "runScenario('escape')");
      const s = await dbgState(window);

      expect(s.inventory).toContain('Fighter Sword');
      expect(s.inventory).toContain('Fighters Shield');
      expect(s.inventory).toContain('Lamp');

      expect(s.completedChecks).toContain("Link's House");
      expect(s.completedChecks).toContain('Secret Passage');
      expect(s.completedChecks).toContain('Hyrule Castle - Map Chest');
      expect(s.completedChecks).toContain('Hyrule Castle - Boomerang Chest');
      expect(s.completedChecks).toHaveLength(4);
    });
  });

  test('logs are emitted for tracker state changes', async () => {
    await withMock(window, async () => {
      await dbg(window, "addItem('Lamp')");
      await dbg(window, "openChest('Secret Passage')");
      await dbg(window, 'poll()');
      await window.waitForTimeout(200);

      const logs = await getLogEntries(window);
      const trackerLogs = logs.filter((l: any) => l.message.includes('[Tracker]'));
      expect(trackerLogs.length).toBeGreaterThan(0);
    });
  });

  test('invalid check/item names return helpful errors', async () => {
    await withMock(window, async () => {
      const chestResult = await dbg(window, "openChest('Nonexistent Chest')");
      expect(chestResult).toContain('Unknown check');
      expect(chestResult).toContain('listChecks');

      const itemResult = await dbg(window, "addItem('Nonexistent Item')");
      expect(itemResult).toContain('Unknown item');
      expect(itemResult).toContain('listItems');
    });
  });

  test('listChecks and listItems return non-empty arrays', async () => {
    const checks = await dbg(window, 'listChecks()');
    expect(checks.length).toBeGreaterThan(50);
    expect(checks).toContain('Secret Passage');

    const items = await dbg(window, 'listItems()');
    expect(items.length).toBeGreaterThan(20);
    expect(items).toContain('Lamp');
  });
});
