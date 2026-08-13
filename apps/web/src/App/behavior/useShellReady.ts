/* @layer renderer-appshell @kind hook */
/**
 * useShellReady — tells the main process the UI may be shown.
 *
 * The old signal fired on first mount, which was too early: the window was revealed
 * while profiles were still resolving and the landing page had not been chosen, so the
 * shell visibly assembled itself afterwards. This one waits for startup to settle and
 * then for two frames — the first commits the settled layout, the second proves it
 * painted — so the first thing the user sees is the finished UI.
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
      requestAnimationFrame(() => window.api?.shellReady?.());
    });
  }, [settled]);
};

export { useShellReady };
