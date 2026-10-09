/* @layer electron-main @kind logic */
import type { BrowserWindow } from 'electron';
import { FRAME_MS } from './fade-window.constants';

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
