/* @layer electron-main @kind logic */
/**
 * Opacity ramp for a BrowserWindow. setOpacity is a no-op without a compositing
 * window manager (a bare X11 session), so nothing downstream may depend on the
 * ramp running.
 */
import type { BrowserWindow } from 'electron';

const FRAME_MS = 16;

const fadeWindow = (
  win: BrowserWindow,
  to: number,
  durationMs: number,
  onDone?: () => void,
): void => {
  const from = win.getOpacity();
  if (from === to || durationMs <= 0) {
    if (!win.isDestroyed()) win.setOpacity(to);
    onDone?.();
    return;
  }

  const startedAt = Date.now();
  const timer = setInterval(() => {
    if (win.isDestroyed()) {
      clearInterval(timer);
      return;
    }
    const t = Math.min(1, (Date.now() - startedAt) / durationMs);
    win.setOpacity(from + (to - from) * t);
    if (t < 1) return;
    clearInterval(timer);
    onDone?.();
  }, FRAME_MS);
};

export { fadeWindow };
