/* @layer electron-main @kind logic */
import type { BrowserWindow, Rectangle } from 'electron';
import { screen } from 'electron';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import { getUserDataPath } from '../lib/paths';
import { stripBom } from '../lib/json-store';

interface WindowState {
  x?: number;
  y?: number;
  width: number;
  height: number;
  isMaximized: boolean;
  isFullscreen: boolean;
}

const DEFAULT_STATE: WindowState = {
  width: 1280,
  height: 720,
  isMaximized: false,
  isFullscreen: false,
};

// Tracked via move/resize: getNormalBounds() is unreliable on Windows with
// titleBarStyle: 'hidden' (it includes the invisible frame).
let cachedNormalBounds: Rectangle | null = null;

const getStatePath = (): string => {
  return getUserDataPath('config', 'window-state.json');
};

const loadWindowState = (): WindowState => {
  try {
    const raw = readFileSync(getStatePath(), 'utf-8');
    const saved = JSON.parse(stripBom(raw)) as Partial<WindowState>;

    const state: WindowState = {
      width: typeof saved.width === 'number' && saved.width >= 360 ? saved.width : DEFAULT_STATE.width,
      height: typeof saved.height === 'number' && saved.height >= 280 ? saved.height : DEFAULT_STATE.height,
      isMaximized: saved.isMaximized === true,
      isFullscreen: saved.isFullscreen === true,
      x: typeof saved.x === 'number' ? saved.x : undefined,
      y: typeof saved.y === 'number' ? saved.y : undefined,
    };

    // Verify the saved position is still within a visible display
    if (state.x !== undefined && state.y !== undefined) {
      const displays = screen.getAllDisplays();
      const visible = displays.some((d) => {
        const { x, y, width, height } = d.workArea;
        return (
          state.x! >= x - 50 &&
          state.x! < x + width - 50 &&
          state.y! >= y - 50 &&
          state.y! < y + height - 50
        );
      });
      if (!visible) {
        state.x = undefined;
        state.y = undefined;
      }
    }

    return state;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== 'ENOENT') {
      console.warn(`[window-state] Failed to read ${getStatePath()}, using defaults:`, err);
    }
    return DEFAULT_STATE;
  }
};

/**
 * Put a window at its saved size/position/mode, BEFORE it is ever visible.
 * Saved state holds CONTENT bounds while the constructor takes WINDOW bounds, and
 * titleBarStyle:'hidden' makes the two disagree on Windows, hence not constructor options.
 */
const applyWindowState = (win: BrowserWindow, state: WindowState): void => {
  if (state.x !== undefined && state.y !== undefined) {
    win.setContentBounds({ x: state.x, y: state.y, width: state.width, height: state.height });
  } else {
    win.setContentSize(state.width, state.height);
    win.center();
  }
  if (state.isMaximized) win.maximize();
  if (state.isFullscreen) win.setFullScreen(true);
};

const trackWindowState = (win: BrowserWindow): void => {
  const updateNormalBounds = (): void => {
        if (!win.isMaximized() && !win.isFullScreen() && !win.isMinimized()) {
          cachedNormalBounds = win.getContentBounds();
        }
      };

  win.on('move', updateNormalBounds);
  win.on('resize', updateNormalBounds);

  // Initialize cache with current bounds
  updateNormalBounds();
};

const saveWindowState = (win: BrowserWindow): void => {
  const isMaximized = win.isMaximized();
  const isFullscreen = win.isFullScreen();

  const bounds = cachedNormalBounds ?? win.getContentBounds();

  const state: WindowState = {
    x: bounds.x,
    y: bounds.y,
    width: bounds.width,
    height: bounds.height,
    isMaximized,
    isFullscreen,
  };

  try {
    const filePath = getStatePath();
    mkdirSync(dirname(filePath), { recursive: true });
    writeFileSync(filePath, JSON.stringify(state, null, 2), 'utf-8');
  } catch (err) {
    console.error('[window-state] Failed to save:', err);
  }
};

export { loadWindowState, applyWindowState, trackWindowState, saveWindowState };
export type { WindowState };
