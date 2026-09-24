/* @layer electron-main @kind logic */
/**
 * The OS windows that hold widgets on their own: one per widget id, loading the
 * same renderer with `?widget=<id>` so it draws that widget alone. Frameless,
 * the widget's own title bar does the job. Each reports its bounds to the main
 * window as it moves, and its closing, so the layout can dock the widget back.
 */
import { BrowserWindow, screen } from 'electron';
import { join } from 'path';
import { is } from '@electron-toolkit/utils';
import type { WindowBounds } from '@shared/types/widget-layout';
import type { WidgetSlice } from '@shared/types/widget-relay';
import { emit } from '../lib/ipc/handle';
import { getMainWindow } from '../window/create-window';
import { resolveWindowIcon } from '../window/window-icon';
import { parseInstanceConfig } from '../instance';

const DEFAULT_BOUNDS = { width: 360, height: 480 } as const;
const MIN_WIDTH = 240;
const MIN_HEIGHT = 160;
const BOUNDS_DEBOUNCE_MS = 300;

const windows = new Map<string, BrowserWindow>();

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

const openPopOut = (id: string, bounds?: WindowBounds): void => {
  const existing = windows.get(id);
  if (existing && !existing.isDestroyed()) {
    existing.focus();
    return;
  }
  const instance = parseInstanceConfig();
  const win = new BrowserWindow({
    ...placeOn(bounds),
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
  windows.set(id, win);

  let boundsTimer: ReturnType<typeof setTimeout> | null = null;
  const reportBounds = (): void => {
    if (boundsTimer) clearTimeout(boundsTimer);
    boundsTimer = setTimeout(() => {
      const main = getMainWindow();
      const b = boundsOf(win);
      if (main && b) emit(main, 'widget:bounds', id, b);
    }, BOUNDS_DEBOUNCE_MS);
  };
  win.on('moved', reportBounds);
  win.on('resized', reportBounds);
  win.on('closed', () => {
    if (boundsTimer) clearTimeout(boundsTimer);
    windows.delete(id);
    const main = getMainWindow();
    if (main) emit(main, 'widget:closed', id);
  });
  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  loadWidget(win, id);
};

const closePopOut = (id: string): void => {
  const win = windows.get(id);
  if (win && !win.isDestroyed()) win.close();
};

const listPopOuts = (): string[] => [...windows.keys()].filter((id) => !windows.get(id)?.isDestroyed());

/** Sends one published slice to every open pop-out. */
const relayToPopOuts = (slice: WidgetSlice): void => {
  for (const win of windows.values()) emit(win, 'widget:relay', slice);
};

const closeAllPopOuts = (): void => {
  for (const win of windows.values()) if (!win.isDestroyed()) win.close();
};

export { closeAllPopOuts, closePopOut, listPopOuts, openPopOut, relayToPopOuts };
