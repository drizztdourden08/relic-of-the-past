// Playwright script to launch Electron app and take a screenshot for debugging.
// Usage: npx playwright test tests/screenshot.spec.ts
// Or:    node -e "require('./tests/screenshot')" (not directly, use playwright runner)

import { test } from '@playwright/test';
import { _electron as electron } from 'playwright';
import { join } from 'path';

test('capture electron window screenshot', async () => {
  const app = await electron.launch({
    args: [join(__dirname, '..', 'dist', 'electron', 'main.js')],
    env: { ...process.env, NODE_ENV: 'production' },
  });

  const window = await app.firstWindow();

  // Collect console messages
  const logs: string[] = [];
  window.on('console', (msg) => {
    const line = `[${msg.type()}] ${msg.text()}`;
    logs.push(line);
    console.log(line);
  });

  // Collect page errors
  const errors: string[] = [];
  window.on('pageerror', (err) => {
    errors.push(err.message);
    console.log('[PAGE ERROR]', err.message);
  });

  await window.waitForLoadState('domcontentloaded');
  await window.waitForTimeout(3000);

  // Take screenshot
  await window.screenshot({ path: 'tests/screenshots/window.png' });

  // Inspect DOM
  const rootHtml = await window.evaluate(() => {
    const root = document.getElementById('root');
    return root ? root.innerHTML : 'NO #root FOUND';
  });
  console.log('--- #root innerHTML ---');
  console.log(rootHtml || '(empty)');

  // Check for failed resource loads
  const failedResources = await window.evaluate(() => {
    return performance.getEntriesByType('resource')
      .filter((r: any) => r.responseStatus >= 400 || r.responseStatus === 0)
      .map((r: any) => `${r.name} (status: ${r.responseStatus})`);
  });
  if (failedResources.length > 0) {
    console.log('--- Failed resources ---');
    failedResources.forEach((r: string) => console.log(r));
  }

  console.log(`\nLogs: ${logs.length}, Errors: ${errors.length}`);

  await app.close();
});
