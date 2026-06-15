/* @layer shared-platform @kind logic */
/**
 * Device port — mobile/device-lifecycle concerns that have no desktop equivalent:
 * keeping the screen awake during gameplay, device haptics (the phone buzzing on
 * game events, distinct from controller rumble), and a hook for when the app is
 * backgrounded (so mobile can save-on-background like desktop saves on close).
 * Electron is a no-op here — the desktop already handles these via window.api /
 * its own lifecycle; Capacitor fulfils it with KeepAwake / Haptics / App plugins.
 */
type Unsubscribe = () => void;

interface DevicePort {
  keepAwake: () => void; // hold a wake lock (gameplay)
  allowSleep: () => void; // release it
  vibrate: (durationMs: number) => void; // device haptic; no-op where unavailable
  onAppPause: (cb: () => void) => Unsubscribe; // app sent to background
}

export type { DevicePort };
