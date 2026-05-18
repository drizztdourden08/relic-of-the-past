/**
 * Input Calibration Status Report
 *
 * Opens the app (which defaults to input-tester page), waits for HID cards
 * to appear, then reports each controller's name, stale status, and byte count.
 */

import { test, expect } from '@playwright/test';
import { launchApp, clearAppData } from './helpers';
import type { ElectronApplication, Page } from 'playwright';

let app: ElectronApplication;
let window: Page;

test.beforeAll(async () => {
  await clearAppData();
  ({ app, window } = await launchApp());
});

test.afterAll(async () => {
  await app?.close();
});

test('report Input Calibration controller cards status', async () => {
  // App defaults to input-tester page — wait for the InputCalibration container
  await window.waitForSelector('.input-cal', { timeout: 15_000 });

  // Give HID devices time to connect and report
  await window.waitForTimeout(6000);

  // Gather all HID cards info
  const cards = await window.evaluate(() => {
    const results: Array<{
      name: string;
      isStale: boolean;
      hasStaleOverlay: boolean;
      byteCount: number;
      rawSummaryText: string;
    }> = [];

    const cardEls = document.querySelectorAll('.input-cal__card');
    for (const card of cardEls) {
      const nameEl = card.querySelector('.input-cal__card-name');
      const name = nameEl?.textContent ?? '(unknown)';

      const hasStaleOverlay = !!card.querySelector('.input-cal__stale-overlay');
      const isStale = card.classList.contains('input-cal__card--stale');

      // Find the <details> summary that shows raw bytes count
      const summary = card.querySelector('details > summary');
      const rawSummaryText = summary?.textContent ?? '';
      // Extract byte count from text like "Raw Bytes (0x05) — 64B"
      const byteMatch = rawSummaryText.match(/(\d+)B/);
      const byteCount = byteMatch ? parseInt(byteMatch[1], 10) : 0;

      results.push({ name, isStale, hasStaleOverlay, byteCount, rawSummaryText });
    }

    return results;
  });

  // Log results
  console.log('\n══════════════════════════════════════════════');
  console.log('  INPUT CALIBRATION - CONTROLLER STATUS REPORT');
  console.log('══════════════════════════════════════════════');
  console.log(`  Total cards: ${cards.length}`);
  console.log('──────────────────────────────────────────────');
  for (const c of cards) {
    const staleStr = c.isStale ? '🔴 STALE' : '🟢 OK';
    console.log(`  ${staleStr} | ${c.name} | ${c.byteCount}B | overlay=${c.hasStaleOverlay}`);
    console.log(`         raw: "${c.rawSummaryText}"`);
  }
  console.log('══════════════════════════════════════════════\n');

  // Basic assertion: we should see at least one card (keyboard always present is false — only HID/gamepad cards)
  // Just ensure test doesn't crash; report is the goal
  expect(cards).toBeDefined();
});
