/* @layer renderer-stores @kind logic */
/**
 * The widget layout, live: the split tree around the game, the floating and
 * popped widgets, per-widget frame options, and the two bits of transient UI
 * state that go with them (Alt peek, the open options panel). Every change
 * lands in localStorage at once and in the profile through the injected IO,
 * whose writes are already debounced; a --fresh launch never persists.
 */
import { create } from 'zustand';
import type {
  DockEdge, PoppedWidget, Rect, WidgetFrame, WidgetId, WidgetLayout, WindowBounds, WindowPoint,
} from '@shared/types/widget-layout';
import type { DockBackTarget } from '@shared/ipc';
import type { LayoutEdit } from '@ds/composites/DockLayout/DockLayout.type';
import { GAP } from '@ds/composites/DockLayout/behavior/layout-tree';
import { floatingRect, placeFloating } from '@ds/composites/DockLayout/behavior/place-floating';
import { createDefaultLayout, getWidgetDefinition } from '@ds/composites/Widget/behavior/createWidgetState';
import {
  loadLayoutForProfile, loadLayoutLocal, saveLayoutForProfile, saveLayoutLocal,
} from '@ds/composites/Widget/behavior/widgetStore';
import type { WidgetPersistenceIO } from '@ds/composites/Widget/behavior/widgetStore';
import {
  applyEdit, dockOnEdge, dropFrame, floatWidget, isWidgetOpen, placementOf, popOutWidget, removeEverywhere, setFrame,
  setMakeRoom, setPopped, setPoppedBounds,
} from './widget-layout-edits';
import { useGameRectStore } from './game-rect-store';

interface StartupOverride {
  fresh: boolean;
  widgets: string[];
}

/** A widget's own window dragged over the app: where, and whether it was just released there. */
interface ExternalDrag {
  id: WidgetId;
  point: WindowPoint;
  released: boolean;
}

interface WidgetLayoutState {
  layout: WidgetLayout;
  profileId: string | null;
  peek: boolean;
  optionsFor: { id: WidgetId; anchor: Rect } | null;
  externalDrag: ExternalDrag | null;
  hydrate: (profileId: string | null, io: WidgetPersistenceIO, startup: StartupOverride) => Promise<void>;
  apply: (edit: LayoutEdit) => void;
  open: (id: WidgetId) => void;
  close: (id: WidgetId) => void;
  toggle: (id: WidgetId) => void;
  dock: (id: WidgetId, edge: DockEdge) => void;
  float: (id: WidgetId) => void;
  popOut: (id: WidgetId) => void;
  /** Puts a popped widget back in the app: on an edge, floating, or its default edge. */
  dockBack: (id: WidgetId, where?: DockBackTarget) => void;
  setPoppedBounds: (id: WidgetId, bounds: WindowBounds) => void;
  setPopped: (id: WidgetId, patch: Partial<PoppedWidget>) => void;
  /** A popped window moves over the app (point) or left it (null); `released` marks the drop. */
  setExternalDrag: (drag: ExternalDrag | null) => void;
  /** The drop resolved: apply the edit and close the window, or leave it out when it landed on nothing. */
  dropIn: (id: WidgetId, edit: LayoutEdit | null) => void;
  setMakeRoom: (id: WidgetId, makeRoom: boolean) => void;
  setFrame: (id: WidgetId, patch: Partial<WidgetFrame>) => void;
  resetWidget: (id: WidgetId) => void;
  resetLayout: () => void;
  setPeek: (peek: boolean) => void;
  openOptions: (id: WidgetId, anchor: Rect) => void;
  closeOptions: () => void;
}

const defaultEdge = (id: WidgetId): DockEdge => getWidgetDefinition(id)?.defaultSide ?? 'right';

/** The play area the floating fractions are taken against; the window until the dock has measured. */
const gameRect = (): Rect =>
  useGameRectStore.getState().rect ?? { x: 0, y: 0, width: window.innerWidth, height: window.innerHeight };

/** --widgets= forces each listed widget open, docked and making room on its default side. */
const forceStartupWidgets = (layout: WidgetLayout, ids: string[]): WidgetLayout =>
  ids.reduce((acc, id) => (getWidgetDefinition(id) ? dockOnEdge(acc, id, defaultEdge(id), true) : acc), layout);

let persistIo: WidgetPersistenceIO | null = null;
let persistFresh = false;

const useWidgetLayoutStore = create<WidgetLayoutState>((set, get) => {
  const commit = (layout: WidgetLayout): void => {
    set({ layout });
    if (persistFresh) return;
    saveLayoutLocal(layout);
    const { profileId } = get();
    if (profileId && persistIo) void saveLayoutForProfile(profileId, layout, persistIo);
  };
  const edit = (fn: (layout: WidgetLayout) => WidgetLayout): void => commit(fn(get().layout));

  return {
    layout: createDefaultLayout(),
    profileId: null,
    peek: false,
    optionsFor: null,
    externalDrag: null,

    hydrate: async (profileId, io, startup) => {
      persistIo = io;
      persistFresh = startup.fresh;
      const base = startup.fresh
        ? createDefaultLayout()
        : profileId ? await loadLayoutForProfile(profileId, io) : loadLayoutLocal();
      const layout = forceStartupWidgets(base, startup.widgets);
      set({ layout, profileId, optionsFor: null });
      if (!startup.fresh) saveLayoutLocal(layout);
    },

    apply: (layoutEdit) => edit((layout) => applyEdit(layout, layoutEdit, gameRect())),

    open: (id) => edit((layout) => (isWidgetOpen(layout, id) ? layout : dockOnEdge(layout, id, defaultEdge(id)))),
    close: (id) => {
      if (get().optionsFor?.id === id) set({ optionsFor: null });
      edit((layout) => removeEverywhere(layout, id));
    },
    toggle: (id) => (isWidgetOpen(get().layout, id) ? get().close(id) : get().open(id)),

    dock: (id, target) => edit((layout) => dockOnEdge(layout, id, target)),
    float: (id) => edit((layout) => {
      const def = getWidgetDefinition(id);
      const game = gameRect();
      const wanted = { x: game.x + GAP, y: game.y + GAP, ...(def?.defaultFloatingSize ?? { width: 320, height: 280 }) };
      const others = layout.floating.filter((f) => f.id !== id).map((f) => floatingRect(f, game));
      const placed = placeFloating(game, others, wanted);
      return placed ? floatWidget(layout, id, placed, game) : dockOnEdge(layout, id, defaultEdge(id));
    }),
    // The OS window is the main process's: opened here, closed by dockBack, and its closing
    // (by the user or by dockBack) comes back as widget:closed, which the app shell turns
    // into a plain layout dockBack.
    popOut: (id) => {
      if (getWidgetDefinition(id)?.popOut !== true) return;
      edit((layout) => popOutWidget(layout, id));
      const { id: _id, ...popped } = get().layout.popped.find((p) => p.id === id) ?? { id };
      void window.api.popOutWidget(id, popped);
    },
    dockBack: (id, where) => {
      window.api.dockBackWidget(id, where);
      if (where === 'float') { get().float(id); return; }
      edit((layout) => dockOnEdge(layout, id, where ?? defaultEdge(id)));
    },
    setPoppedBounds: (id, bounds) => edit((layout) => setPoppedBounds(layout, id, bounds)),
    setPopped: (id, patch) => edit((layout) => setPopped(layout, id, patch)),
    setExternalDrag: (drag) => set({ externalDrag: drag }),
    dropIn: (id, layoutEdit) => {
      set({ externalDrag: null });
      if (!layoutEdit) return;
      window.api.dockBackWidget(id);
      edit((layout) => applyEdit(removeEverywhere(layout, id), layoutEdit, gameRect()));
    },

    setMakeRoom: (id, makeRoom) => edit((layout) => setMakeRoom(layout, id, makeRoom)),
    setFrame: (id, patch) => edit((layout) => setFrame(layout, id, patch)),
    resetWidget: (id) => {
      if (get().optionsFor?.id === id) set({ optionsFor: null });
      edit((layout) => dropFrame(removeEverywhere(layout, id), id));
    },
    resetLayout: () => {
      set({ optionsFor: null });
      commit(createDefaultLayout());
    },

    setPeek: (peek) => {
      if (get().peek !== peek) set({ peek });
    },
    openOptions: (id, anchor) => set({ optionsFor: placementOf(get().layout, id) ? { id, anchor } : null }),
    closeOptions: () => set({ optionsFor: null }),
  };
});

export { useWidgetLayoutStore };
export type { ExternalDrag, StartupOverride, WidgetLayoutState };
