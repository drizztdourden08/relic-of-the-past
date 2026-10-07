/* @layer electron-main @kind logic */
/**
 * A popped window dragged over the app: while the cursor is inside the app's
 * content the main window hears where, so it can draw its drop hints, and a
 * release there is a drop. Outside, the drag is a plain window move.
 */
import { screen } from 'electron';
import type { BrowserWindow } from 'electron';
import type { WindowPoint } from '@shared/types/widget-layout';
import { emit } from '../lib/ipc/handle';
import { getMainWindow } from '../window/create-window';

const within = (p: { x: number; y: number }, box: { x: number; y: number; width: number; height: number }): boolean =>
  p.x >= box.x && p.x < box.x + box.width && p.y >= box.y && p.y < box.y + box.height;

/**
 * The cursor as a point inside the app's content while it drags `win`, or
 * null. A drag has the cursor on the window's own title bar, so a cursor that
 * is over the app but not over the window is not dragging it there.
 */
const cursorInApp = (win: BrowserWindow): WindowPoint | null => {
  const main = getMainWindow();
  if (!main || main.isDestroyed() || main.isMinimized() || win.isDestroyed()) return null;
  const cursor = screen.getCursorScreenPoint();
  if (!within(cursor, win.getBounds())) return null;
  const box = main.getContentBounds();
  return within(cursor, box) ? { x: cursor.x - box.x, y: cursor.y - box.y } : null;
};

interface DragInHooks {
  /** True while the registry itself moves the window, so no hint is sent. */
  isTowed: () => boolean;
}

const watchDragIn = (id: string, win: BrowserWindow, hooks: DragInHooks): void => {
  let over = false;
  const tell = (point: WindowPoint | null): void => {
    const main = getMainWindow();
    if (!main) return;
    if (point || over) emit(main, 'widget:dragOver', id, point);
    over = point !== null;
  };
  win.on('move', () => { if (!hooks.isTowed()) tell(cursorInApp(win)); });
  win.on('moved', () => {
    if (hooks.isTowed()) return;
    const point = cursorInApp(win);
    const main = getMainWindow();
    if (point && main) emit(main, 'widget:dropIn', id, point);
    tell(null);
  });
};

export { cursorInApp, watchDragIn };
