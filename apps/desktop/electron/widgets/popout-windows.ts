/* @layer electron-main @kind logic */
/**
 * The OS windows that hold widgets on their own: one per widget id, loading the
 * same renderer with `?widget=<id>` so it draws that widget alone. Frameless,
 * the widget's own title bar does the job. Each reports its bounds to the main
 * window as it moves, and its closing, so the layout can dock the widget back.
 * Pin, snapping and linked moves live in the registry.
 */
import { BrowserWindow, screen } from 'electron';
import { join } from 'path';
import { is } from '@electron-toolkit/utils';
import type { PoppedWidget, WindowBounds } from '@shared/types/widget-layout';
import type { WidgetSlice } from '@shared/types/widget-relay';
import type { DockBackTarget } from '@shared/ipc';
import { emit } from '../lib/ipc/handle';
import { getMainWindow } from '../window/create-window';
import { resolveWindowIcon } from '../window/window-icon';
import { parseInstanceConfig } from '../instance';
import { cursorInApp, watchDragIn } from './popout-drag-in';
import { openIds, register, settled, snapWanted, unregister, windowOf, windows } from './popout-registry';

const DEFAULT_BOUNDS = { width: 360, height: 480 } as const;
const MIN_WIDTH = 240;
const MIN_HEIGHT = 160;
const BOUNDS_DEBOUNCE_MS = 300;

/** Where each window asked to go as it closed, read back by the closed event. */
const closingTo = new Map<string, DockBackTarget | undefined>();

/** A window's bounds if it is a real window; null once it is gone. */
const boundsOf = (win: BrowserWindow): WindowBounds | null => {
  if (win.isDestroyed()) return null;
  const { x, y, width, height } = win.getBounds();
  return { x, y, width, height };
};

/** Somewhere on a display: a remembered spot whose screen is gone falls back to the main window's display. */
const placeOn = (wanted: WindowBounds | undefined): Partial<WindowBounds> => {
  if (wanted && screen.getAllDisplays().some((d) => screen.getDisplayMatching(wanted).id === d.id)) return wanted;
  const main = getMainWindow();
  const anchor = main && !main.isDestroyed() ? main.getBounds() : screen.getPrimaryDisplay().workArea;
  return { x: anchor.x + 40, y: anchor.y + 40, ...DEFAULT_BOUNDS };
};

const loadWidget = (win: BrowserWindow, id: string): void => {
  const query = { widget: id };
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    const url = new URL(process.env['ELECTRON_RENDERER_URL']);
    url.searchParams.set('widget', id);
    void win.loadURL(url.toString());
  } else {
    void win.loadFile(join(__dirname, '../renderer/index.html'), { query });
  }
};

const openPopOut = (id: string, popped?: Omit<PoppedWidget, 'id'>): void => {
  const existing = windowOf(id);
  if (existing) {
    existing.focus();
    return;
  }
  const instance = parseInstanceConfig();
  const win = new BrowserWindow({
    ...placeOn(popped?.bounds),
    minWidth: MIN_WIDTH,
    minHeight: MIN_HEIGHT,
    frame: false,
    autoHideMenuBar: true,
    title: `Relic of the Past - ${id}`,
    icon: resolveWindowIcon(instance.name),
    backgroundColor: '#000000',
    webPreferences: {
      preload: join(__dirname, '../preload/preload.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false,
      backgroundThrottling: false,
    },
  });
  const entry = register(id, win, popped);

  let boundsTimer: ReturnType<typeof setTimeout> | null = null;
  const reportBounds = (): void => {
    if (boundsTimer) clearTimeout(boundsTimer);
    boundsTimer = setTimeout(() => {
      const main = getMainWindow();
      const b = boundsOf(win);
      if (main && b) emit(main, 'widget:bounds', id, b);
    }, BOUNDS_DEBOUNCE_MS);
  };
  // Snapping only while the drag is a plain window move; over the app it is a drop-in.
  win.on('will-move', (event, wanted) => {
    if (cursorInApp(win)) return;
    const snapped = snapWanted(id, wanted);
    if (!snapped) return;
    event.preventDefault();
    win.setBounds(snapped);
  });
  win.on('moved', () => { settled(id); reportBounds(); });
  win.on('resized', () => { settled(id); reportBounds(); });
  win.on('closed', () => {
    if (boundsTimer) clearTimeout(boundsTimer);
    unregister(id);
    const where = closingTo.get(id);
    closingTo.delete(id);
    const main = getMainWindow();
    if (main) emit(main, 'widget:closed', id, where);
  });
  watchDragIn(id, win, { isTowed: () => entry.towed });
  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  loadWidget(win, id);
};

const closePopOut = (id: string, where?: DockBackTarget): void => {
  const win = windowOf(id);
  if (!win) return;
  closingTo.set(id, where);
  win.close();
};

const listPopOuts = (): string[] => openIds();

/** Sends one published slice to every open pop-out. */
const relayToPopOuts = (slice: WidgetSlice): void => {
  for (const win of windows()) emit(win, 'widget:relay', slice);
};

const closeAllPopOuts = (): void => {
  for (const win of windows()) win.close();
};

export { closeAllPopOuts, closePopOut, listPopOuts, openPopOut, relayToPopOuts };
