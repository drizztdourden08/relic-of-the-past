/**
 * Verify the game actually renders (not black) after clicking Play.
 */
import { test, expect } from '@playwright/test';
import {
  launchApp,
  getScreen,
  PROJECT_ROOT,
} from './helpers';
import { join } from 'path';

test('Game renders after clicking Play', async () => {
  const { app, window } = await launchApp({ muted: true });

  try {
    const screen = await getScreen(window);

    if (screen === 'profile') {
      // Click play
      const playBtn = await window.$('button:has-text("Play"), .profile-hub__play-btn');
      expect(playBtn).not.toBeNull();
      await playBtn!.click();
    }

    // Wait for game to start and render frames
    await window.waitForTimeout(5000);

    // Take screenshot for visual verification
    const screenshotPath = join(PROJECT_ROOT, 'tests', 'screenshots', 'game-render.png');
    const screenshot = await window.screenshot({ path: screenshotPath });

    // Verify the screenshot has non-black pixels (game is actually rendering)
    const { PNG } = await import('pngjs');
    const png = PNG.sync.read(screenshot);
    let nonBlack = 0;
    for (let i = 0; i < png.data.length; i += 4) {
      if (png.data[i] > 5 || png.data[i + 1] > 5 || png.data[i + 2] > 5) {
        nonBlack++;
      }
    }
    const totalPixels = png.data.length / 4;
    const nonBlackPct = (nonBlack / totalPixels) * 100;
    console.log(`Screenshot: ${nonBlackPct.toFixed(1)}% non-black pixels`);

    expect(nonBlackPct).toBeGreaterThan(1);
  } finally {
    await app.close();
  }
});
