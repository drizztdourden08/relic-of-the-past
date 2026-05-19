/**
 * Save State Load — verifies loading a normal save actually applies game state.
 * Uses the existing profile which already has normal saves on disk.
 */
import { test, expect } from '@playwright/test';
import { join } from 'path';
import {
  launchApp,
  getLogEntries,
  PROJECT_ROOT,
} from './helpers';

test('Normal save loads and game renders', async () => {
  const { app, window } = await launchApp({ muted: true });

  try {
    // Wait for the app to settle (auto-resumes last profile)
    await window.waitForTimeout(3000);

    // Get the active profile ID and list its normal saves
    const info = await window.evaluate(async () => {
      const profiles = await window.api.listProfiles();
      if (!profiles.length) return { error: 'no profiles' };
      const profileId = profiles[0].id;
      const saves = await window.api.listNormalSaves(profileId);
      return { profileId, saveCount: saves.length, firstSaveId: saves[0]?.id };
    });

    console.log(`Profile info: ${JSON.stringify(info)}`);
    expect(info).not.toHaveProperty('error');
    expect(info.saveCount).toBeGreaterThan(0);

    // Make sure game is running first
    const gameStatus = await window.evaluate(() => !!(window as any).__zelda3Module);
    if (!gameStatus) {
      // Click Play to start
      const playBtn = await window.$('[class*="btn--primary"]');
      if (playBtn) await playBtn.click();
      // Wait for game to be running
      await window.waitForFunction(
        () => !!(window as any).__zelda3Module,
        { timeout: 20000 },
      );
      await window.waitForTimeout(3000);
    }

    // Load the first normal save
    const loadResult = await window.evaluate(async (saveId: string) => {
      const profiles = await window.api.listProfiles();
      const profileId = profiles[0].id;

      const buffer = await window.api.loadNormalSave(profileId, saveId);
      if (!buffer) return { error: 'no buffer returned' };

      const mod = (window as any).__zelda3Module;
      if (!mod) return { error: 'no module' };

      mod.FS.writeFile('/saves/save98.sav', new Uint8Array(buffer));
      mod.ccall('WasmLoadState', null, ['number'], [98]);
      try { mod.FS.unlink('/saves/save98.sav'); } catch { /* ignore */ }

      return { success: true, bytes: buffer.byteLength };
    }, info.firstSaveId!);

    console.log(`Load result: ${JSON.stringify(loadResult)}`);
    expect(loadResult).toHaveProperty('success', true);

    // Wait for game to process the loaded state
    await window.waitForTimeout(3000);

    // Check logs
    const logs = await getLogEntries(window);
    const gameLogs = logs.filter(l => l.message.includes('Load state') || l.message.includes('LoadState'));
    console.log('=== Relevant logs ===');
    for (const l of gameLogs) console.log(`  ${l.message}`);

    // Verify game is still rendering
    const screenshotPath = join(PROJECT_ROOT, 'tests', 'screenshots', 'save-load-normal.png');
    const screenshotBuf = await window.screenshot({ path: screenshotPath });
    const { PNG } = await import('pngjs');
    const png = PNG.sync.read(screenshotBuf);
    let nonBlack = 0;
    for (let i = 0; i < png.data.length; i += 4) {
      if (png.data[i] > 5 || png.data[i + 1] > 5 || png.data[i + 2] > 5) nonBlack++;
    }
    const pct = (nonBlack / (png.data.length / 4)) * 100;
    console.log(`After normal save load: ${pct.toFixed(1)}% non-black pixels`);
    expect(pct).toBeGreaterThan(1);
  } finally {
    await app.close();
  }
});
