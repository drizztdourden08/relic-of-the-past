/* @layer renderer-lib @kind logic */
// Machine-level facts reachable without a main process, plus the controllers SDL3 reads
// directly. Device ids carry the vendor/product pair a controller-mapping report needs.
import { listControllerDevices } from '@app/lib/input/controller-devices-store';
import { recallControllerName } from '@app/lib/input/controller-name-cache';
import type { DeviceEnvironment } from './types';

// Both are non-standard Chromium extensions with no lib.dom typings.
interface ChromiumNavigator extends Navigator {
  deviceMemory?: number;
}

interface ChromiumPerformance extends Performance {
  memory?: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number };
}

const readJsHeap = (): DeviceEnvironment['jsHeap'] => {
  const memory = (performance as ChromiumPerformance).memory;
  if (!memory) return null;
  return {
    usedBytes: memory.usedJSHeapSize,
    totalBytes: memory.totalJSHeapSize,
    limitBytes: memory.jsHeapSizeLimit,
  };
};

/**
 * SDL3 claims every controller directly (the Gamepad API path is gone). Reads the device
 * snapshot, not the reported-input set: SDL only emits state on change, so an untouched pad
 * would be missing from a dump meant to list every device. Names come from the session's
 * controller:added cache (controller-name-cache.ts), falling back to the snapshot's fields.
 */
/** Asks the controller layer directly, not the input manager's cache, which only exists once
 *  the manager has started and refreshed; earlier diagnostics reported no controllers. */
const readHidDevices = async (): Promise<string[]> => {
  try {
    const entries = await listControllerDevices();
    return entries
      .filter((d) => d.status === 'ready')
      .map((d) => {
        const name = recallControllerName({ vendorId: d.vendorId, productId: d.productId });
        return `${name ?? d.name ?? d.product ?? 'Unrecognized HID device'} (${d.deviceKey})`;
      });
  } catch {
    return [];
  }
};

const probeDevice = async (): Promise<DeviceEnvironment> => ({
  logicalCores: navigator.hardwareConcurrency || null,
  deviceMemoryGb: (navigator as ChromiumNavigator).deviceMemory ?? null,
  jsHeap: readJsHeap(),
  maxTouchPoints: navigator.maxTouchPoints ?? 0,
  languages: Array.from(navigator.languages ?? [navigator.language]).filter(Boolean),
  timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  online: navigator.onLine,
  hidDevices: await readHidDevices(),
});

export { probeDevice };
