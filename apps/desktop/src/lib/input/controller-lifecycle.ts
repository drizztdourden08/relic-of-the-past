/* @layer renderer-lib @kind logic */
/**
 * Controller Lifecycle — manages init/reset of HID controllers
 * via the controller registry and main-process IPC.
 */

import { findController } from '@shared/input/register-all';
import type { ControllerContext } from '@shared/input/base';
import { webHidReader } from './hid-reader';

type ControllerEntry = { controller: ReturnType<typeof findController>; ctx: ControllerContext };

const initController = async (deviceKey: string, vendorId: string, productId: string, activeControllers: Map<string, ControllerEntry>): Promise<void> => {
  const controller = findController(vendorId, productId);
  if (!controller) return;
  const ctx: ControllerContext = {
    deviceKey,
    hidWrite: (data: number[]) => window.api.writeHidDevice(deviceKey, data),
    usbOpen: async (vid: number, pid: number) => {
      if (!navigator.usb) return null;
      try {
        return await navigator.usb.requestDevice({ filters: [{ vendorId: vid, productId: pid }] });
      } catch { return null; }
    },
    usbClose: async (device: USBDevice) => {
      try { await device.close(); } catch { /* ignore */ }
    },
    log: (msg: string) => webHidReader.addDiag(msg),
    delay: (ms: number) => new Promise(r => setTimeout(r, ms)),
  };
  activeControllers.set(deviceKey, { controller, ctx });
  try {
    await controller.init(ctx);
  } catch (e: any) {
    webHidReader.addDiag(`⚠ Controller init failed (${deviceKey}): ${e.message}`);
  }
};

const resetController = async (deviceKey: string, activeControllers: Map<string, ControllerEntry>): Promise<void> => {
  const entry = activeControllers.get(deviceKey);
  if (!entry || !entry.controller) return;
  try {
    await entry.controller.reset(entry.ctx);
    webHidReader.addDiag(`Controller reset successful (${deviceKey})`);
  } catch (e: any) {
    webHidReader.addDiag(`⚠ Controller reset failed (${deviceKey}): ${e.message}`);
  }
};

export { initController, resetController };
export type { ControllerEntry };
