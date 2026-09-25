/* @layer electron-main @kind logic */
/**
 * Bounds in the units setBounds expects. On a scaled Windows display the
 * will-move event hands physical pixels, and feeding those back as DIP grows
 * the window by the scale factor on every snap. So a move keeps the window's
 * own size, and its new corner is converted when it arrived scaled.
 */
import { screen } from 'electron';
import type { BrowserWindow } from 'electron';
import type { WindowBounds } from '@shared/types/widget-layout';

/** A move destination in DIP, at the window's current size. */
const moveInDip = (win: BrowserWindow, wanted: WindowBounds): WindowBounds => {
  const cur = win.getBounds();
  const scale = screen.getDisplayMatching(cur).scaleFactor;
  const scaledIsCloser = Math.abs(wanted.width - cur.width * scale) < Math.abs(wanted.width - cur.width);
  const physical = scale !== 1 && scaledIsCloser;
  const corner = physical ? screen.screenToDipPoint({ x: wanted.x, y: wanted.y }) : wanted;
  return { x: Math.round(corner.x), y: Math.round(corner.y), width: cur.width, height: cur.height };
};

/** Remembered bounds kept inside the work area of the display they fall on. */
const clampToDisplay = (wanted: WindowBounds): WindowBounds => {
  const area = screen.getDisplayMatching(wanted).workArea;
  const width = Math.min(wanted.width, area.width);
  const height = Math.min(wanted.height, area.height);
  const x = Math.min(Math.max(wanted.x, area.x), area.x + area.width - width);
  const y = Math.min(Math.max(wanted.y, area.y), area.y + area.height - height);
  return { x, y, width, height };
};

export { clampToDisplay, moveInDip };
