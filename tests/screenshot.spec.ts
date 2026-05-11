// Playwright script to launch Electron app, trigger ROM load, capture all LogBus entries.
// Usage: npx playwright test tests/screenshot.spec.ts

import { test } from '@playwright/test';
import { _electron as electron } from 'playwright';
import { join } from 'path';

test('capture logs and screenshot', async () => {
  const app = await electron.launch({
    args: [join(__dirname, '..', 'dist', 'electron', 'main.js')],
    env: { ...process.env, NODE_ENV: 'production' },
  });

  const window = await app.firstWindow();

  // Collect browser console output
  const consoleLogs: string[] = [];
  window.on('console', (msg) => {
    consoleLogs.push(`[console.${msg.type()}] ${msg.text()}`);
  });
  window.on('pageerror', (err) => {
    consoleLogs.push(`[PAGE ERROR] ${err.message}`);
  });

  await window.waitForLoadState('domcontentloaded');
  await window.waitForTimeout(1000);

  // Check the userData path and whether cached assets exist
  const userDataPath = await window.evaluate(() => window.api.getUserDataPath());
  console.log(`\n=== userData: ${userDataPath} ===`);

  const hasAssets = await window.evaluate(() => window.api.checkAssets());
  console.log(`=== Cached assets: ${hasAssets} ===`);

  if (hasAssets) {
    // Trigger Load ROM from menu — it will find cached assets and skip the dialog
    await window.click('[aria-label="Menu"]');
    await window.waitForTimeout(300);
    await window.locator('.dropdown-item', { hasText: 'Load ROM' }).click();
    await window.waitForTimeout(5000);
  } else {
    console.log('No cached assets found — skipping ROM load (would open native dialog)');
    await window.waitForTimeout(1000);
  }

  // Take screenshot
  await window.screenshot({ path: 'tests/screenshots/window.png' });

  // Pull all LogBus entries
  const logEntries = await window.evaluate(() => {
    return (window as any).__logEntries?.() ?? [];
  });

  // Scrape overlay DOM as fallback
  const overlayText = await window.evaluate(() => {
    const entries = document.querySelectorAll('.log-entry');
    return Array.from(entries).map((el) => {
      const channel = el.querySelector('.log-channel')?.textContent ?? '';
      const msg = el.querySelector('.log-message')?.textContent ?? '';
      const time = el.querySelector('.log-time')?.textContent ?? '';
      return `${time} ${channel} ${msg}`;
    });
  });

  console.log('\n=== LogBus Entries ===');
  if (logEntries.length > 0) {
    for (const e of logEntries) {
      console.log(`[${e.channel}/${e.level}] ${e.message}`);
    }
  } else {
    console.log('(no entries via __logEntries)');
  }

  if (overlayText.length > 0) {
    console.log('\n=== Overlay DOM ===');
    for (const line of overlayText) {
      console.log(line);
    }
  }

  if (consoleLogs.length > 0) {
    console.log('\n=== Browser Console ===');
    for (const line of consoleLogs) {
      console.log(line);
    }
  }

  await app.close();
});
