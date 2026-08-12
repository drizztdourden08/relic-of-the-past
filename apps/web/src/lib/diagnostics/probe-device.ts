/* @layer renderer-lib @kind logic */
/**
 * Machine-level facts reachable without a main process, plus the controllers
 * SDL3 is reading directly. Device ids carry the vendor/product pair, which is
 * what a controller-mapping report needs to be actionable.
 */
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
 * SDL3 claims every controller directly now — the Gamepad API path has been
 * removed, so a debug report only needs this list to be honest about what's
 * actually connected. Reads the device snapshot (InputManager.hidDeviceCache)
 * rather than the reported-input set: SDL only emits state on change, so a
 * pad nobody has touched yet would otherwise be missing from a debug dump
 * whose whole purpose is to list every attached device. Names come from the
 * session's own controller:added cache (see controller-name-cache.ts) —
 * SDL's own name for the device it opened, never a hand-authored database
 * guess — falling back to the snapshot's own name/product fields.
 */
/** Asks the controller layer directly rather than reading the input manager's
 *  cache. That cache only exists once the manager has started and completed a
 *  refresh, so anything collecting diagnostics before or outside that saw an
 *  empty list and reported no controllers on a machine that plainly had one. */
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
