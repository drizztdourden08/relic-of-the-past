/* @layer renderer-stores @kind logic */
/**
 * View-only state for the HUD layout editor's own chrome. It is never written to a
 * layout document, so nothing here can leak into a saved file. The grid
 * overlay and snapping flags are read by the stage's own drawing/drag code;
 * the outline/inspector widths and the outline's collapsed-node set are read
 * by the outline and the panel layout. This store only holds the bits; it
 * draws, snaps and folds nothing itself.
 *
 * COLLAPSE STATE LIVES HERE, NOT ON THE DOCUMENT. Which rows are folded shut
 * is a fact about how someone is currently looking at a tree, not a fact about
 * the HUD the tree describes. The same reasoning keeps `snappingEnabled`
 * off the document. It survives a re-render (a `Set` in a store) but is scoped
 * to no particular node; re-opening the editor on a different layout starts
 * every row expanded again, which is the documented default.
 */
import { create } from 'zustand';

/** Neither rail can be dragged narrower than this. Past it there is no room
 *  left for what the panel actually shows. */
const PANEL_MIN_WIDTH = 220;
/** Nor wider than this. A rail is a rail, not half the editor. */
const PANEL_MAX_WIDTH = 480;
/** The width both rails opened at before either was ever resized (20rem at a
 *  16px root, matching what `HudLayoutEditor.css` shipped as a fixed width). */
const PANEL_DEFAULT_WIDTH = 320;

const clampPanelWidth = (px: number): number =>
  Math.round(Math.min(Math.max(px, PANEL_MIN_WIDTH), PANEL_MAX_WIDTH));

/**
 * HOW FAR ONE PRESS OF A STEPPER MOVES (§55). This is the editor's own step, chosen
 * once at the bottom of the stage column and obeyed by every stepped field in
 * the panel. A gap is 0, 2, 4 or 8 in every shipped document because the game's
 * own grid is 8px, so stepping it by 1 is eight presses to reach the number
 * anybody actually wanted.
 *
 * IT IS VIEW STATE AND NEVER REACHES A DOCUMENT, exactly like `snappingEnabled`:
 * "I am nudging by fours this afternoon" is a fact about the person editing, not
 * about the HUD they are editing.
 */
const EDITOR_STEPS: readonly number[] = [1, 2, 4, 8];

/**
 * WHICH CELLS THE STAGE IS ECHOING. The grid editor's own selection, published
 * so `EditorStage` can wash the equivalent rectangle without the selection
 * being threaded up through three sections and back down. Visual only: nothing
 * reads it to edit with (§48).
 */
interface GridEcho {
  containerId: string;
  c0: number;
  c1: number;
  r0: number;
  r1: number;
}

/**
 * THE SAME CHANNEL, FOR THE FLEX MANIPULATION SECTION (§58). It says which children
 * the strip has picked, so the stage can wash the boxes they were placed in.
 *
 * A SECOND KEY INSTEAD OF A WIDER ONE. A grid echo names CELLS, which exist
 * whether or not a child stands in them, and a flex echo names CHILDREN, which
 * are the only thing a flex container has. Folding both into one shape would
 * mean a cell reference that sometimes means an index, and the stage would have
 * to ask the engine which it was looking at.
 *
 * Visual only: nothing reads either to edit with (§48, §50).
 */
interface FlexEcho {
  containerId: string;
  childIds: readonly string[];
}

interface HudEditorViewState {
  gridOverlayEnabled: boolean;
  /** Stage resize snapping to the 8px game grid and to sibling edges. */
  snappingEnabled: boolean;
  /** Outline panel width in px, clamped to `PANEL_MIN_WIDTH`/`PANEL_MAX_WIDTH`. */
  outlineWidth: number;
  /** Inspector panel width in px, with the same bounds. */
  inspectorWidth: number;
  /** Outline node ids currently folded shut. Absence means expanded, which is the default. */
  collapsedNodeIds: ReadonlySet<string>;
  /** `null` while no grid cell is selected anywhere in the inspector. */
  gridEcho: GridEcho | null;
  /** `null` while no flex child is selected anywhere in the inspector. */
  flexEcho: FlexEcho | null;
  /** What one press of a stepped number field moves. One of `EDITOR_STEPS`. */
  editorStep: number;
}

interface HudEditorViewStore extends HudEditorViewState {
  toggleGridOverlay: () => void;
  toggleSnapping: () => void;
  setOutlineWidth: (px: number) => void;
  setInspectorWidth: (px: number) => void;
  toggleNodeCollapsed: (id: string) => void;
  /** Folds every id OUT of the collapsed set, for an ancestor chain being expanded
   *  so a newly selected, previously hidden row can be scrolled to. */
  expandNodeIds: (ids: readonly string[]) => void;
  /** Folds every id back IN. The inverse of the above, and it exists for one
   *  caller: a drag that spring-opened rows on the way past them puts back the
   *  ones the drop did not land in (§45), because a gesture that leaves six
   *  folders open behind it has damaged the view to do a move. */
  collapseNodeIds: (ids: readonly string[]) => void;
  setGridEcho: (echo: GridEcho | null) => void;
  setFlexEcho: (echo: FlexEcho | null) => void;
  setEditorStep: (step: number) => void;
}

const useHudEditorViewStore = create<HudEditorViewStore>()((set) => ({
  gridOverlayEnabled: false,
  snappingEnabled: false,
  outlineWidth: PANEL_DEFAULT_WIDTH,
  inspectorWidth: PANEL_DEFAULT_WIDTH,
  collapsedNodeIds: new Set(),
  gridEcho: null,
  flexEcho: null,
  editorStep: EDITOR_STEPS[0] ?? 1,
  toggleGridOverlay: () => set((s) => ({ gridOverlayEnabled: !s.gridOverlayEnabled })),
  toggleSnapping: () => set((s) => ({ snappingEnabled: !s.snappingEnabled })),
  setOutlineWidth: (px) => set({ outlineWidth: clampPanelWidth(px) }),
  setInspectorWidth: (px) => set({ inspectorWidth: clampPanelWidth(px) }),
  toggleNodeCollapsed: (id) => set((s) => {
    const next = new Set(s.collapsedNodeIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    return { collapsedNodeIds: next };
  }),
  expandNodeIds: (ids) => set((s) => {
    if (ids.every((id) => !s.collapsedNodeIds.has(id))) return s;
    const next = new Set(s.collapsedNodeIds);
    ids.forEach((id) => next.delete(id));
    return { collapsedNodeIds: next };
  }),
  collapseNodeIds: (ids) => set((s) => {
    if (ids.every((id) => s.collapsedNodeIds.has(id))) return s;
    const next = new Set(s.collapsedNodeIds);
    ids.forEach((id) => next.add(id));
    return { collapsedNodeIds: next };
  }),
  setGridEcho: (echo) => set((s) => {
    const was = s.gridEcho;
    const same = was === echo || (!!was && !!echo && was.containerId === echo.containerId
      && was.c0 === echo.c0 && was.c1 === echo.c1 && was.r0 === echo.r0 && was.r1 === echo.r1);
    return same ? s : { gridEcho: echo };
  }),
  setFlexEcho: (echo) => set((s) => {
    const was = s.flexEcho;
    const same = was === echo || (!!was && !!echo && was.containerId === echo.containerId
      && was.childIds.length === echo.childIds.length
      && was.childIds.every((id, i) => id === echo.childIds[i]));
    return same ? s : { flexEcho: echo };
  }),
  setEditorStep: (step) => set({ editorStep: EDITOR_STEPS.includes(step) ? step : 1 }),
}));

export { EDITOR_STEPS, PANEL_MAX_WIDTH, PANEL_MIN_WIDTH, useHudEditorViewStore };
export type { FlexEcho, GridEcho, HudEditorViewState };
