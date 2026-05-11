/**
 * Canvas rendering debug test — verifies viewport sizing and settings pipeline.
 */

import { test, expect } from '@playwright/test';
import { existsSync } from 'fs';
import {
  launchApp,
  clearAppData,
  seedSingleProfile,
  startGameFromProfile,
  screenshot,
  TEST_ROMS,
  SCREENSHOTS_DIR,
} from './helpers';
import { join } from 'path';

test.describe('Canvas Rendering', () => {
  test.beforeEach(async () => {
    await clearAppData();
  });

  test('16:9 settings produce correct canvas dimensions and centered rendering', async () => {
    test.skip(!existsSync(TEST_ROMS.usa), 'Test ROM not available');

    const { app, window } = await launchApp({ muted: true });
    const { profileId } = await seedSingleProfile(window, TEST_ROMS.usa, 'Render Test');

    // Write 16:9 settings to profile config
    await window.evaluate((pid) => {
      return window.api.writeConfig(pid, {
        autosave: false,
        displayPerfInTitle: false,
        disableFrameDelay: false,
        aspectRatio: '16:9',
        extendY: true,
        unchangedSprites: false,
        noVisualFixes: false,
        windowScale: 2,
        fullscreen: 0,
        newRenderer: true,
        enhancedMode7: true,
        noSpriteLimits: true,
        ignoreAspectRatio: false,
        linearFiltering: false,
        dimFlashes: false,
        outputMethod: 'SDL',
        itemSwitchLR: false,
        itemSwitchLRLimit: false,
        turnWhileDashing: false,
        mirrorToDarkworld: false,
        collectItemsWithSword: false,
        breakPotsWithSword: false,
        disableLowHealthBeep: false,
        skipIntroOnKeypress: false,
        showMaxItemsInYellow: false,
        moreActiveBombs: false,
        carryMoreRupees: false,
        miscBugFixes: false,
        gameChangingBugFixes: false,
        cancelBirdTravel: false,
        enableAudio: true,
        audioFreq: 44100,
        audioChannels: 2,
        audioSamples: 2048,
        enableMSU: 'false',
        resumeMSU: true,
        msuVolume: 100,
      });
    }, profileId);

    // Reload to pick up settings
    await window.reload();
    await window.waitForTimeout(3000);

    // Verify the config was saved and can be read back
    const savedConfig = await window.evaluate((pid) => {
      return window.api.readConfig(pid);
    }, profileId);
    expect(savedConfig?.aspectRatio).toBe('16:9');
    expect(savedConfig?.extendY).toBe(true);

    // Start game
    await startGameFromProfile(window, 20_000);
    await window.waitForTimeout(4000);

    // Verify INI reached WASM
    const iniContent = await window.evaluate(() => {
      const mod = (window as any).__zelda3Module;
      if (!mod?.FS) return '';
      try { return mod.FS.readFile('/zelda3.ini', { encoding: 'utf8' }); }
      catch { return ''; }
    });
    expect(iniContent).toContain('extend_y, 16:9');

    // Screenshot the game running
    await screenshot(window, 'canvas-16x9-running');

    // Inspect canvas state
    const canvasInfo = await window.evaluate(() => {
      const canvas = document.querySelector('#canvas') as HTMLCanvasElement | null;
      if (!canvas) return null;
      const container = canvas.parentElement;
      return {
        bufferWidth: canvas.width,
        bufferHeight: canvas.height,
        cssWidth: canvas.clientWidth,
        cssHeight: canvas.clientHeight,
        containerWidth: container?.clientWidth ?? 0,
        containerHeight: container?.clientHeight ?? 0,
      };
    });

    // Buffer should be 852×480 for 16:9 with extend_y
    // (240*16/9-256)/2 = 85, width = 85*2+256 = 426, canvas = 426*2 = 852, height = 240*2 = 480
    expect(canvasInfo).not.toBeNull();
    expect(canvasInfo!.bufferWidth).toBe(852);
    expect(canvasInfo!.bufferHeight).toBe(480);

    // Aspect ratio should be approximately 16:9 (1.775)
    const bufferRatio = canvasInfo!.bufferWidth / canvasInfo!.bufferHeight;
    expect(bufferRatio).toBeGreaterThan(1.7);
    expect(bufferRatio).toBeLessThan(1.8);

    // CSS display should be scaled up to fill container
    expect(canvasInfo!.cssWidth).toBeGreaterThan(canvasInfo!.bufferWidth);

    await app.close();
  });

  test('4:3 default settings produce standard canvas dimensions', async () => {
    test.skip(!existsSync(TEST_ROMS.usa), 'Test ROM not available');

    const { app, window } = await launchApp({ muted: true });
    await seedSingleProfile(window, TEST_ROMS.usa, '4x3 Test');

    // Don't write any settings — use defaults
    await window.reload();
    await window.waitForTimeout(2000);

    await startGameFromProfile(window, 20_000);
    await window.waitForTimeout(4000);

    await screenshot(window, 'canvas-default-running');

    const canvasInfo = await window.evaluate(() => {
      const canvas = document.querySelector('.game-layer__canvas') as HTMLCanvasElement | null;
      if (!canvas) return null;
      return {
        bufferWidth: canvas.width,
        bufferHeight: canvas.height,
        cssWidth: canvas.clientWidth,
        cssHeight: canvas.clientHeight,
        inlineWidth: canvas.style.width,
        inlineHeight: canvas.style.height,
        rect: canvas.getBoundingClientRect(),
      };
    });

    console.log('4:3 Canvas info:', JSON.stringify(canvasInfo, null, 2));

    await app.close();
  });
});
