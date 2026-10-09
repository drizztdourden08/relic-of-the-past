/* @layer shared-platform @kind types */
type Unsubscribe = () => void;

type BackEdge = 'left' | 'right';

interface DevicePort {
  keepAwake: () => void;
  allowSleep: () => void;
  vibrate: (durationMs: number) => void;
  onAppPause: (cb: () => void) => Unsubscribe;
  onBackButton: (cb: (edge: BackEdge) => void) => Unsubscribe;
}

export type { BackEdge, DevicePort };
