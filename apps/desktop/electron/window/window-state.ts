import { BrowserWindow, screen } from 'electron';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import { getUserDataPath } from '../lib/paths';

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

function getStatePath(): string {
  return getUserDataPath('config', 'window-state.json');
}

function loadWindowState(): WindowState {
  try {
    const raw = readFileSync(getStatePath(), 'utf-8');
    const saved = JSON.parse(raw) as Partial<WindowState>;

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
  } catch {
    return DEFAULT_STATE;
  }
}

function saveWindowState(win: BrowserWindow): void {
  const isMaximized = win.isMaximized();
  const isFullscreen = win.isFullScreen();

  // Save the non-maximized/non-fullscreen bounds so restoring returns to the windowed size
  const bounds = isMaximized || isFullscreen ? win.getNormalBounds() : win.getBounds();

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
}

export { loadWindowState, saveWindowState };
