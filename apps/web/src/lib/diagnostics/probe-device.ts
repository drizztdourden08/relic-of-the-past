/* @layer renderer-lib @kind logic */
/**
 * Machine-level facts reachable without a main process, plus the controllers the
 * Gamepad API can see. Gamepad ids carry the vendor/product pair, which is what a
 * controller-mapping report needs to be actionable.
 */
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

const readGamepads = (): string[] => {
  try {
    return Array.from(navigator.getGamepads?.() ?? [])
      .filter((pad): pad is Gamepad => pad !== null)
      .map((pad) => `${pad.id} (${pad.buttons.length} buttons, ${pad.axes.length} axes, ${pad.mapping || 'no mapping'})`);
  } catch {
    return [];
  }
};

const probeDevice = (): DeviceEnvironment => ({
  logicalCores: navigator.hardwareConcurrency || null,
  deviceMemoryGb: (navigator as ChromiumNavigator).deviceMemory ?? null,
  jsHeap: readJsHeap(),
  maxTouchPoints: navigator.maxTouchPoints ?? 0,
  languages: Array.from(navigator.languages ?? [navigator.language]).filter(Boolean),
  timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  online: navigator.onLine,
  gamepads: readGamepads(),
});

export { probeDevice };
