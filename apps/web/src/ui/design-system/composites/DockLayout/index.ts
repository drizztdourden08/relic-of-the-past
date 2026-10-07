/* @layer renderer-components @kind barrel */
export { DockLayout } from './DockLayout';
export type { DockLayoutProps, DragModifiers, LayoutEdit } from './DockLayout.type';
export { GAP, STRIP, gameRectOf, holdsGame, layoutTree, rectOf } from './behavior/layout-tree';
export type { DividerRect, LaidOut, LeafRect } from './behavior/layout-tree';
export {
  GAME_NODE, createPane, evenSplit, findLeaf, insertAt, paneOf, patchPane, removeLeaf, removeWidget, resizeSplit,
  swapPanes, widgetsIn,
} from './behavior/edit-tree';
export { floatingRect, overlaps, placeFloating, toFloating } from './behavior/place-floating';
export { dropZones, hitTarget, inRect } from './behavior/hit-target';
export type { DragSubject, DropZone } from './behavior/hit-target';
