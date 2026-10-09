/* @layer electron-main @kind logic */
import { screen } from 'electron';
import { readFileSync } from 'fs';
import { stripBom } from '../../lib/json-store';
import { getStatePath } from './state-path';
import { DEFAULT_STATE } from './window-state.constants';
import type { WindowState } from './window-state.type';

const isOnVisibleDisplay = (stateX: number, stateY: number): boolean =>
  screen.getAllDisplays().some((d) => {
    const { x, y, width, height } = d.workArea;
    return (
      stateX >= x - 50 &&
      stateX < x + width - 50 &&
      stateY >= y - 50 &&
      stateY < y + height - 50
    );
  });

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

    if (state.x !== undefined && state.y !== undefined && !isOnVisibleDisplay(state.x, state.y)) {
      state.x = undefined;
      state.y = undefined;
    }

    return state;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== 'ENOENT') {
      console.warn(`[window-state] Failed to read ${getStatePath()}, using defaults:`, err);
    }
    return DEFAULT_STATE;
  }
};

export { loadWindowState };
