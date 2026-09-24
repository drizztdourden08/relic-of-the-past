/* @layer renderer-stores @kind logic */
/**
 * Pure moves of one widget through the layout: into a pane, onto the game as a
 * floating panel, out to its own window, or gone. Each starts by taking the
 * widget out of wherever it is, so a widget is never in two places. The
 * DockLayout's LayoutEdit is mapped onto the same moves here.
 */
import type {
  DockEdge, DropTarget, LayoutNode, PoppedWidget, Rect, WidgetFrame, WidgetId, WidgetLayout, WindowBounds,
} from '@shared/types/widget-layout';
import type { LayoutEdit } from '@ds/composites/DockLayout/DockLayout.type';
import {
  GAME_NODE, createPane, evenSplit, findLeaf, insertAt, paneOf, patchPane, removeLeaf, removeWidget, resizeSplit, swapPanes,
} from '@ds/composites/DockLayout/behavior/edit-tree';
import { toFloating } from '@ds/composites/DockLayout/behavior/place-floating';
import { getWidgetDefinition } from '@ds/composites/Widget/behavior/createWidgetState';
import { resolveSplit } from './widget-layout-resolve';

type DockTarget = Exclude<DropTarget, { at: 'float' }>;
type Placement = 'docked' | 'floating' | 'popped';

const DEFAULT_OPACITY = 0.92;

const placementOf = (layout: WidgetLayout, id: WidgetId): Placement | null => {
  if (paneOf(layout.dock, id)) return 'docked';
  if (layout.floating.some((f) => f.id === id)) return 'floating';
  if (layout.popped.some((p) => p.id === id)) return 'popped';
  return null;
};

const isWidgetOpen = (layout: WidgetLayout, id: WidgetId): boolean => placementOf(layout, id) !== null;

const frameOf = (layout: WidgetLayout, id: WidgetId): WidgetFrame => ({
  opacity: DEFAULT_OPACITY,
  show: getWidgetDefinition(id)?.defaultVisibility ?? 'game-only',
  ...layout.frame[id],
});

/** Takes the widget out of every place; a popped one leaves its window facts behind for the next pop-out. */
const removeEverywhere = (layout: WidgetLayout, id: WidgetId): WidgetLayout => {
  const popped = layout.popped.find((p) => p.id === id);
  const poppedMemory = popped ? { ...layout.poppedMemory, [id]: { ...popped, link: null } } : layout.poppedMemory;
  return {
    ...layout,
    dock: removeWidget(layout.dock, id) ?? GAME_NODE,
    floating: layout.floating.filter((f) => f.id !== id),
    popped: layout.popped.filter((p) => p.id !== id),
    ...(poppedMemory ? { poppedMemory } : {}),
  };
};

/** A target whose pane vanished with the widget's removal cannot be landed on. */
const targetExists = (tree: LayoutNode, target: DockTarget): boolean =>
  target.at === 'outer' || findLeaf(tree, target.key) !== null;

const dockWidget = (layout: WidgetLayout, id: WidgetId, target: DockTarget, makeRoom: boolean): WidgetLayout => {
  const cleared = removeEverywhere(layout, id);
  if (!targetExists(cleared.dock, target)) return layout;
  return { ...cleared, dock: insertAt(cleared.dock, createPane([id], makeRoom), target) };
};

const dockOnEdge = (layout: WidgetLayout, id: WidgetId, edge: DockEdge, makeRoom = true): WidgetLayout =>
  dockWidget(layout, id, { at: 'outer', edge }, makeRoom);

const floatWidget = (layout: WidgetLayout, id: WidgetId, rect: Rect, game: Rect): WidgetLayout => {
  const cleared = removeEverywhere(layout, id);
  return { ...cleared, floating: [...cleared.floating, toFloating(id, rect, game)] };
};

/** The window facts kept for a widget between pop-outs: its last bounds, pin and snapping. */
const popOutWidget = (layout: WidgetLayout, id: WidgetId): WidgetLayout => {
  const kept = layout.popped.find((p) => p.id === id) ?? layout.poppedMemory?.[id];
  const cleared = removeEverywhere(layout, id);
  return { ...cleared, popped: [...cleared.popped, { ...kept, id, link: null }] };
};

/** Patches a popped widget's window facts: bounds as it moves, pin, snap, link. */
const setPopped = (layout: WidgetLayout, id: WidgetId, patch: Partial<PoppedWidget>): WidgetLayout => ({
  ...layout,
  popped: layout.popped.map((p) => (p.id === id ? { ...p, ...patch, id } : p)),
});

const setPoppedBounds = (layout: WidgetLayout, id: WidgetId, bounds: WindowBounds): WidgetLayout =>
  setPopped(layout, id, { bounds });

const moveGame = (layout: WidgetLayout, target: Exclude<DropTarget, { at: 'float' } | { at: 'tab' }>): WidgetLayout => {
  const rest = removeLeaf(layout.dock, 'game');
  if (!rest || !targetExists(rest, target)) return layout;
  return { ...layout, dock: insertAt(rest, GAME_NODE, target) };
};

const setMakeRoom = (layout: WidgetLayout, id: WidgetId, makeRoom: boolean): WidgetLayout => {
  const pane = paneOf(layout.dock, id);
  return pane ? { ...layout, dock: patchPane(layout.dock, pane.key, { makeRoom }) } : layout;
};

const setFrame = (layout: WidgetLayout, id: WidgetId, patch: Partial<WidgetFrame>): WidgetLayout =>
  ({ ...layout, frame: { ...layout.frame, [id]: { ...frameOf(layout, id), ...patch } } });

const dropFrame = (layout: WidgetLayout, id: WidgetId): WidgetLayout => {
  const frame = { ...layout.frame };
  delete frame[id];
  return { ...layout, frame };
};

/** One DockLayout edit, applied. `game` is the play area the floating fractions are taken against. */
const applyEdit = (layout: WidgetLayout, edit: LayoutEdit, game: Rect): WidgetLayout => {
  switch (edit.type) {
    case 'move-widget': return dockWidget(layout, edit.id, edit.target, edit.makeRoom);
    case 'float-widget': return floatWidget(layout, edit.id, edit.rect, game);
    case 'move-game': return moveGame(layout, edit.target);
    case 'swap-panes': return { ...layout, dock: swapPanes(layout.dock, edit.keyA, edit.keyB) };
    case 'resize': {
      const hit = resolveSplit(layout.dock, edit.node, edit.index);
      return hit ? { ...layout, dock: resizeSplit(layout.dock, hit.node, hit.index, edit.delta) } : layout;
    }
    case 'even': {
      const hit = resolveSplit(layout.dock, edit.node, edit.index);
      return hit ? { ...layout, dock: evenSplit(layout.dock, hit.node, hit.index) } : layout;
    }
    case 'activate-tab': return { ...layout, dock: patchPane(layout.dock, edit.key, { active: edit.id }) };
    case 'pop-out': return popOutWidget(layout, edit.id);
  }
};

export {
  applyEdit, dockOnEdge, dockWidget, dropFrame, floatWidget, frameOf, isWidgetOpen, placementOf, popOutWidget,
  removeEverywhere, setFrame, setMakeRoom, setPopped, setPoppedBounds,
};
export type { DockTarget, Placement };
