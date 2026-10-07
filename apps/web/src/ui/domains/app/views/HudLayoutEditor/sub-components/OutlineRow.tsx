/* @layer renderer-components @kind component */
/**
 * One line of the outline: what the node is, and every handle the gesture needs.
 *
 * The whole row is the drag source AND the drop target, which is what makes the
 * tree editable with one gesture instead of with a palette of modes. The drop
 * intent it is showing is a class, not a separate indicator element, so
 * the line the pointer promises is the line the drop lands on.
 *
 * IT BINDS ONE POINTER HANDLER, NOT FIVE DRAG ONES. The gesture moved to
 * `behavior/useDragGesture.ts`; a row's whole part in it is to arm the drag and
 * to say which id it is (`data-outline-row`, which is how the panel hit-tests
 * whatever is under the pointer once capture has been taken). See that hook's
 * header for why the HTML5 drag API had to go.
 *
 * A ROW MAY CARRY A NOTE. A slot number is never invalid (a node naming one
 * past what the scheme currently previewing reaches still draws, just empty),
 * so the row says which number that is as information, not as an error.
 *
 * A ROW WITH A SUBTREE GETS ITS OWN DISCLOSURE TRIANGLE, sitting outside the
 * name button, not inside it (a button cannot nest another button).
 * Collapsed state is the parent's own. This component only shows it and
 * reports a click.
 */
import { Box } from '@ds/primitives/Box';
import { Button } from '@ds/primitives/Button';
import { Icon } from '@ds/primitives/Icon';
import { IconButton } from '@ds/primitives/IconButton';
import { Text } from '@ds/primitives/Text';
import type { KeyboardEvent as ReactKeyboardEvent, PointerEvent as ReactPointerEvent } from 'react';
import type { DropZone } from '../behavior/drop-intent';

interface OutlineRowProps {
  id: string;
  label: string;
  depth: number;
  kind: 'container' | 'element';
  /** A direct child of the screen: which cell of the root grid it sits in,
   *  e.g. "1,3". A badge only. The cell itself is edited in Placement. */
  cell?: string;
  /** A repeat's own child, or a switch's case/otherwise (e.g. "case 2"). It is
   *  not in any container's own children array, so it neither drags nor accepts a
   *  drop; removing it removes the whole case it belongs to. */
  locked?: string;
  /** The whole-screen root. It is never dragged, reparented or removed, and never
   *  a drag SOURCE, though it stays a valid drop target (a real child can be
   *  added under it, same as any other container). */
  isScreen?: boolean;
  hasChildren: boolean;
  collapsed: boolean;
  selected: boolean;
  dragging: boolean;
  /** The drop the pointer is currently promising ON THIS ROW, or null. The two
   *  `inside` halves reuse the before/after edge lines instead of inventing a
   *  third mark: a dashed box with a line along its top edge reads as "into
   *  this, at the front", which is what it is. */
  dropZone: DropZone | null;
  /** Slot numbers this node names past what the previewed scheme reaches. A
   *  note, never an error; the node still draws, just empty for that number. */
  missingSlots: readonly number[];
  /** Hands the row's own DOM node up so an external selection can be scrolled to it. */
  rowRef?: (element: HTMLElement | null) => void;
  onSelect: () => void;
  onToggleCollapse: () => void;
  onRemove: () => void;
  /** Arms the drag. Nothing happens until the pointer passes the slop
   *  threshold, so a press that becomes a click still selects the row. */
  onDragPointerDown?: (event: ReactPointerEvent) => void;
  /** A drag is dwelling on this collapsed row and it is about to spring open.
   *  The caret turns progressively over the wait, which is the only way to tell
   *  "waiting" from "nothing is going to happen". */
  springing?: boolean;
  /** A keyboard move that had nowhere to go: the row shakes instead of saying
   *  anything, because "you are already at the top" is what the list shows. */
  shaking?: boolean;
  /** The four move shortcuts, scoped to whichever row has focus. */
  onRowKeyDown?: (event: ReactKeyboardEvent) => void;
  /** Opens the row's context menu, from a right-click or from the platform's
   *  own keyboard menu gesture. `null` when the row has no operations at all. */
  onOpenMenu?: () => void;
}

/** The two gestures every desktop platform uses to open a context menu from the
 *  keyboard. A menu that exists to teach keyboard users about keys must not
 *  itself need a mouse. */
const isMenuKey = (event: ReactKeyboardEvent): boolean =>
  event.key === 'ContextMenu' || (event.key === 'F10' && event.shiftKey);

/** The four zones, drawn from the two edge lines the sheet already owns, with no
 *  new rule and no third indicator to keep in step with the other two. */
const DROP_CLASS: Readonly<Record<DropZone, string>> = {
  before: 'is-drop-before',
  'inside-start': 'is-drop-inside is-drop-before',
  'inside-end': 'is-drop-inside is-drop-after',
  after: 'is-drop-after',
};

/**
 * A right-pointing triangle, drawn, not typed. `▸`/`▾` are font glyphs:
 * their size, weight and vertical centring are whatever the typeface decided,
 * and at this row height they came out reading as dots. An SVG path is sized in
 * px, inherits `currentColor`, and rotates to point down when open - one shape
 * in two states instead of two characters that do not match each other.
 */
const CARET_PATH = 'M5.5 3 L10.5 8 L5.5 13 Z';

const OutlineRow = (props: OutlineRowProps) => {
  const {
    id, label, depth, kind, cell, locked, isScreen, hasChildren, collapsed, selected, dragging,
    dropZone, missingSlots, rowRef, onSelect, onToggleCollapse, onRemove, onDragPointerDown,
    springing, shaking, onRowKeyDown, onOpenMenu,
  } = props;

  const classes = [
    'hud-outline__row',
    selected ? 'is-selected' : '',
    dragging ? 'is-dragging' : '',
    dropZone ? DROP_CLASS[dropZone] : '',
    locked ? 'is-locked' : '',
    isScreen ? 'is-screen' : '',
    shaking ? 'is-shaking' : '',
  ].filter(Boolean).join(' ');

  const caret = [
    'hud-outline__caret',
    collapsed ? '' : 'is-open',
    springing ? 'is-springing' : '',
  ].filter(Boolean).join(' ');

  return (
    <Box
      ref={rowRef}
      className={classes}
      style={{ paddingLeft: `calc(var(--space-xs) + ${depth} * var(--space-md))` }}
      data-outline-row={id}
      data-outline-locked={locked ? '' : undefined}
      onPointerDown={onDragPointerDown}
      onKeyDown={(event) => {
        if (onOpenMenu && isMenuKey(event)) { event.preventDefault(); onOpenMenu(); return; }
        onRowKeyDown?.(event);
      }}
      onContextMenu={onOpenMenu ? (event) => { event.preventDefault(); onOpenMenu(); } : undefined}
    >
      {hasChildren ? (
        <IconButton
          variant="ghost"
          size="sm"
          className={caret}
          label={collapsed ? `Expand ${label}` : `Collapse ${label}`}
          onClick={(event) => { event.stopPropagation(); onToggleCollapse(); }}
        >
          <Icon className="hud-outline__caret-mark" paths={[CARET_PATH]} size={12} aria-hidden />
        </IconButton>
      ) : (
        <Box className="hud-outline__caret-spacer" aria-hidden />
      )}
      <Button variant="bare" className="hud-outline__name" aria-pressed={selected} onClick={onSelect}>
        <Text className="hud-outline__glyph" aria-hidden>{kind === 'container' ? '▤' : '◦'}</Text>
        <Text className="hud-outline__text">{label}</Text>
        {cell && <Text className="hud-outline__badge">{cell}</Text>}
        {locked && <Text className="hud-outline__badge" title="Edit this from the case list or the repeat's Content section.">{locked}</Text>}
        {missingSlots.length > 0 && (
          <Text className="hud-outline__note" title="Out of range for the scheme you are previewing. It still draws, just empty.">
            slot {missingSlots.join(', ')} out of range
          </Text>
        )}
      </Button>
      {!locked && !isScreen && <IconButton variant="ghost" size="sm" label={`Remove ${label}`} onClick={onRemove}>✕</IconButton>}
    </Box>
  );
};

export { OutlineRow };
export type { OutlineRowProps };
