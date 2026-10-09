/* @layer renderer-lib @kind types */
interface ChromiumNavigator extends Navigator {
  deviceMemory?: number;
}

interface ChromiumPerformance extends Performance {
  memory?: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number };
}

export type { ChromiumNavigator, ChromiumPerformance };
