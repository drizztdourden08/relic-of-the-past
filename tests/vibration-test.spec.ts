/**
 * Test: SPC2 vibration diagnostics.
 * 1. Dump HID device info (supported reports)
 * 2. Try node-hid write from main process for bulk init
 * 3. Then attempt WebHID haptics
 */
import { test, expect } from '@playwright/test';
import { launchApp } from './helpers';

test('SPC2 procon2tool vibration', async () => {
  const { app, window } = await launchApp({ muted: true });
  await window.waitForTimeout(2000);

  // Dump HID device collections info
  const hidInfo = await window.evaluate(async () => {
    const devices = await navigator.hid.requestDevice({ filters: [{ vendorId: 0x057E, productId: 0x2069 }] });
    if (devices.length === 0) return { error: 'no device' };
    const d = devices[0];
    if (!d.opened) await d.open();
    return {
      productName: d.productName,
      collections: d.collections.map(c => ({
        usagePage: c.usagePage,
        usage: c.usage,
        inputReports: c.inputReports?.map(r => ({ reportId: r.reportId, items: r.items?.length })),
        outputReports: c.outputReports?.map(r => ({ reportId: r.reportId, items: r.items?.length })),
        featureReports: c.featureReports?.map(r => ({ reportId: r.reportId, items: r.items?.length })),
      }))
    };
  });

  console.log('=== HID Device Info ===');
  console.log(JSON.stringify(hidInfo, null, 2));

  // Try IPC to main process: use node-hid to list devices and find MI_01 path
  const nodeHidInfo = await app.evaluate(async ({ ipcMain }) => {
    // This runs in the main process
    const HID = require('node-hid');
    const allDevices = HID.devices();
    const spc2 = allDevices.filter((d: any) => d.vendorId === 0x057E && d.productId === 0x2069);
    return spc2.map((d: any) => ({
      path: d.path,
      interface: d.interface,
      usage: d.usage,
      usagePage: d.usagePage,
      product: d.product,
    }));
  });

  console.log('\n=== node-hid SPC2 devices ===');
  console.log(JSON.stringify(nodeHidInfo, null, 2));

  await app.close();
});
