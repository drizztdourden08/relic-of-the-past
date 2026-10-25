/* @layer renderer-lib @kind logic */
import { inputApi, recallControllerName } from '@drizztdourden08/brock-input/renderer';
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
    const entries = await inputApi().list();
    return entries
      .filter((d) => d.status === 'ready')
      .map((d) => {
        const name = recallControllerName({ vendorId: d.vendorId, productId: d.productId });
        return `${name ?? d.name ?? d.product} (${d.deviceKey})`;
      });
  } catch {
    return [];
  }
};

const probeDevice = async (): Promise<DeviceEnvironment> => ({
  logicalCores: navigator.hardwareConcurrency || null,
  deviceMemoryGb: (navigator as ChromiumNavigator).deviceMemory ?? null,
  jsHeap: readJsHeap(),
  maxTouchPoints: navigator.maxTouchPoints,
  languages: Array.from(navigator.languages).filter(Boolean),
  timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  online: navigator.onLine,
  hidDevices: await readHidDevices(),
});

export { probeDevice };
