/* @layer renderer-appshell @kind hook */
/**
 * Tells the main process the UI may be shown.
 *
 * Firing on first mount was too early: the window was revealed while profiles
 * were still resolving, so the shell visibly assembled itself afterwards. This
 * waits for startup to settle and then for two frames (the first commits the
 * settled layout, the second proves it painted).
 *
 * No-op off Electron (web/mobile have no window to reveal).
 */
import { useEffect, useRef } from 'react';

const useShellReady = (settled: boolean): void => {
  const signalled = useRef(false);

  useEffect(() => {
    if (signalled.current || !settled) return;
    signalled.current = true;
    // Deliberately not cancelled on cleanup: StrictMode's double-invoke would cancel
    // the only scheduled signal and the second pass would find the ref already set,
    // leaving the window hidden until the main-process watchdog fires.
    requestAnimationFrame(() => {
      // Entrance animations go back to normal only once the shell is done, so the layer
      // the app booted into never plays one. Dropped before the signal, in the same
      // frame, so nothing can animate in the gap between the two.
      document.documentElement.classList.remove('booting');
      requestAnimationFrame(() => window.api?.shellReady?.());
    });
  }, [settled]);
};

export { useShellReady };
