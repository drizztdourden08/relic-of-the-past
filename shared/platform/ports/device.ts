/* @layer shared-platform @kind logic */
/**
 * Mobile/device-lifecycle concerns with no desktop equivalent: keeping the screen awake during
 * gameplay, device haptics (the phone buzzing, distinct from controller rumble), and a hook for
 * app backgrounding (save-on-background, like desktop saves on close). Electron is a no-op
 * (window.api / its own lifecycle); Capacitor uses the KeepAwake / Haptics / App plugins.
 */
type Unsubscribe = () => void;

interface DevicePort {
  keepAwake: () => void; // hold a wake lock (gameplay)
  allowSleep: () => void; // release it
  vibrate: (durationMs: number) => void; // device haptic; no-op where unavailable
  onAppPause: (cb: () => void) => Unsubscribe; // app sent to background
  // Android back, intercepted so the app handles it instead of navigating away. The
  // edge says which side a back *swipe* came from ('right' for a button press / no
  // gesture). No-op where there is no back action.
  onBackButton: (cb: (edge: BackEdge) => void) => Unsubscribe;
}

type BackEdge = 'left' | 'right';

export type { DevicePort };
