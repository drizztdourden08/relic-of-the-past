/* @layer renderer-other @kind logic */
/**
 * Capacitor DevicePort: keep-awake during gameplay (@capacitor-community/keep-awake),
 * device haptics (@capacitor/haptics), and an app-backgrounded hook (@capacitor/app
 * appStateChange) used for save-on-background. Haptics buzz the phone on game events,
 * since most Bluetooth pads expose no rumble through the WebView.
 */
import { KeepAwake } from '@capacitor-community/keep-awake';
import { Haptics } from '@capacitor/haptics';
import { App } from '@capacitor/app';
import type { DevicePort } from '@shared/platform';

const createCapacitorDevice = (): DevicePort => ({
  keepAwake: () => { KeepAwake.keepAwake().catch(() => {}); },
  allowSleep: () => { KeepAwake.allowSleep().catch(() => {}); },
  vibrate: (durationMs) => {
    const duration = Math.max(1, Math.min(1000, Math.round(durationMs)));
    Haptics.vibrate({ duration }).catch(() => {});
  },
  onAppPause: (cb) => {
    const handle = App.addListener('appStateChange', ({ isActive }) => { if (!isActive) cb(); });
    return () => { handle.then((h) => h.remove()).catch(() => {}); };
  },
  onBackButton: (cb) => {
    // MainActivity intercepts Back and dispatches a 'rotpback' window event carrying the
    // swipe edge (it reads BackEventCompat.getSwipeEdge); we don't use @capacitor/app's
    // backButton here because it can't tell left from right.
    const handler = (e: Event) => cb((e as CustomEvent).detail === 'left' ? 'left' : 'right');
    window.addEventListener('rotpback', handler);
    return () => window.removeEventListener('rotpback', handler);
  },
});

export { createCapacitorDevice };
