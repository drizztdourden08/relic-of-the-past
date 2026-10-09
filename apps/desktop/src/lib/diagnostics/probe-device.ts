/* @layer renderer-lib @kind logic */
import { inputApi } from '@drizztdourden08/brock-input/renderer';
import { recallControllerName } from '@rotp/input-mapping';
import type { DeviceEnvironment } from './diagnostics.type';
import type { ChromiumNavigator, ChromiumPerformance } from './probe-device.type';

const readJsHeap = (): DeviceEnvironment['jsHeap'] => {
  const memory = (performance as ChromiumPerformance).memory;
  if (!memory) return null;
  return {
    usedBytes: memory.usedJSHeapSize,
    totalBytes: memory.totalJSHeapSize,
    limitBytes: memory.jsHeapSizeLimit,
  };
};

const readHidDevices = async (): Promise<string[]> => {
  try {
    const entries = (await inputApi()?.list()) ?? [];
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
