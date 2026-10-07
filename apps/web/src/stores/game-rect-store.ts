/* @layer renderer-stores @kind logic */
/**
 * The play area's rectangle inside `.app__content`, as the dock layout last
 * measured it: the game leaf grown over the panes that do not make room. The
 * WidgetDock view writes it; GameLayer and the floating debug controls read it.
 * Null before the first layout, and the game then fills the whole content box.
 */
import { create } from 'zustand';
import type { Rect } from '@shared/types/widget-layout';

interface GameRectState {
  rect: Rect | null;
  setRect: (rect: Rect | null) => void;
}

const sameRect = (a: Rect | null, b: Rect | null): boolean =>
  a === b || (a !== null && b !== null && a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height);

const useGameRectStore = create<GameRectState>((set, get) => ({
  rect: null,
  setRect: (rect) => {
    if (!sameRect(get().rect, rect)) set({ rect });
  },
}));

export { useGameRectStore };
export type { GameRectState };
