/* @layer renderer-components @kind types */
/**
 * ONE ACTION TABLE SHAPE, FOR EVERY MANIPULATION COMPONENT (§58).
 *
 * The grid editor invented it (§48/§54) and the flex editor needs exactly the
 * same thing ("the flex should have a manipulation section as well. same
 * principle"), so it moved here instead of being copied: the toolbar, the
 * legend and the keyboard all read ONE table, which is what makes it impossible
 * for a legend to promise a shortcut no button runs.
 *
 * `button` draws in the toolbar, `gesture` exists only in the legend. Both come
 * out of the same table per selection, so the two bands cannot disagree about
 * what is possible.
 */
import type { IconifyIcon } from '@iconify/types';
import type { MousePart } from '@ds/primitives/MouseGlyph';

/** What the legend PRINTS and what the keyboard looks up, as one shape: caps
 *  for the keys, an optional lit mouse beside them. `{mod}` is replaced with
 *  `primaryModifierLabel(os)`, so a cap can never disagree with the key. */
interface EditorShortcut {
  keys?: readonly string[];
  mouse?: MousePart;
}

type EditorActionKind = 'button' | 'gesture';

interface EditorAction {
  key: string;
  kind: EditorActionKind;
  /** Lucide, through `@iconify/react`. `button` only. */
  icon?: IconifyIcon;
  label: string;
  shortcut?: EditorShortcut;
  /** Toolbar rows are grouped by separators; a change of group draws one. */
  group?: string;
  run?: () => void;
  /** Drawn in place but inert: no `run`, no key, no legend row. A button that
   *  vanishes lets the NEXT one slide under the cursor. Pressing "later" twice
   *  on the second-to-last child pressed "earlier" the second time. */
  disabled?: boolean;
}

export type { EditorAction, EditorActionKind, EditorShortcut };
