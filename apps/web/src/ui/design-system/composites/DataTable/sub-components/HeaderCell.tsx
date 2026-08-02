/* @layer renderer-components @kind component */
/**
 * One column header: a drag handle, a sort caret, the ⋯ menu and, on its
 * trailing edge, the seam that resizes it.
 *
 * Two gestures live on this one cell and must never be confused for each other:
 * dragging the cell REORDERS (native HTML5 drag), dragging the seam RESIZES
 * (pointer events). The seam swallows its own pointer events and the cell drops
 * its `draggable` flag while a resize is running.
 *
 * The caret and the menu do deliberately different things. Clicking the caret
 * REPLACES the whole sort with this column (asc → desc → none); the menu names
 * a direction and ADDS a level for it, which is the only route to a
 * multi-column sort. Renaming happens inline here because a dropdown cannot
 * hold a text field — the menu only flips this cell into its editing state.
 *
 * Both controls are hover-revealed, because both are offers rather than
 * information — with one exception: a column that is actually sorted keeps its
 * caret showing at rest, since the direction the rows are in is not chrome.
 *
 * They also sit OUTSIDE the cell's flow, in their own overlay cluster pinned
 * to the trailing edge, so the label lays out against the full header width
 * and shortens only when the column itself is too narrow for it — never
 * because two buttons happen to be standing there. See `data-table__header-
 * chrome` in the sheet for how the text is kept readable underneath them.
 *
 * While a drag is on, this cell is one of three things: the slot the carried
 * column left, a cell stepping aside to open the gap it will land in, or the
 * cell whose edge that gap is against. None of it changes the column list —
 * that happens on the drop and nowhere else.
 *
 * Stepping aside is the one part that is not a class: the distance is the
 * carried column's own width, which has to be measured, and it applies to this
 * column's body cells as much as to its header. See `useColumnShift`.
 */
import { useRef, useState } from 'react';
import { Box } from '../../../primitives/Box';
import { Button } from '../../../primitives/Button';
import { Text } from '../../../primitives/Text';
import { TextInput } from '../../../primitives/TextInput';
import { useMenuOpen } from '../../field-kits/behavior/use-menu-open';
import { columnDragShift, dropEdgeAt } from '../behavior/column-drag-shift';
import { useColumnResize } from '../behavior/use-column-resize';
import { useColumnShift } from '../behavior/use-column-shift';
import { ColumnDragGhost } from './ColumnDragGhost';
import { ColumnMenu } from './ColumnMenu';
import { ColumnResizeHandle } from './ColumnResizeHandle';
import type { DragEvent, KeyboardEvent } from 'react';
import type { FieldDescriptor } from '../../../data/schema/field-descriptor';
import type { SortEntry, TableColumn } from '../../../data/table/types';
import type { PickerNode } from '../behavior/field-picker-nodes';
import type { IdRefTargetFieldResolver } from '../behavior/display-substitution';
import type { ColumnActions, ColumnDragBinding } from '../DataTable.type';
import './HeaderCell.css';

interface HeaderCellProps {
  column: TableColumn;
  field?: FieldDescriptor;
  index: number;
  columnCount: number;
  sortDir?: SortEntry['dir'];
  grouped: boolean;
  /** The addable field tree the ⋯ menu offers, before and after this column. */
  fieldNodes?: readonly PickerNode[];
  /** Injected: which fields a referenced collection offers as a display field. */
  resolveTargetFields?: IdRefTargetFieldResolver;
  actions: ColumnActions;
  drag: ColumnDragBinding;
  /**
   * The rows the offscreen ghost shows values from. Every header holds one
   * ready — which column is picked up is not known until it already has been.
   */
  ghostRows: readonly unknown[];
  /** Total rows in the table, so the ghost can say how many it left out. */
  rowTotal: number;
}

/*
 * The SMALL triangles, not the full-size ones. A sorted column carries its
 * caret permanently, and the caret now sits ON the label rather than beside
 * it, so every unit of width the glyph takes is a unit of the name it covers.
 * The small variants keep the footprint down without giving back any
 * legibility, which is the one thing shrinking the font-size instead would
 * have cost in exact proportion. The unsorted marker is a single double-headed
 * arrow rather than a stacked pair, for the same reason.
 */
const CARETS = { asc: '▴', desc: '▾', none: '↕' } as const;

const HeaderCell = (props: HeaderCellProps) => {
  const {
    column, field, index, columnCount, sortDir,
    grouped, fieldNodes, resolveTargetFields, actions, drag, ghostRows, rowTotal,
  } = props;

  const menu = useMenuOpen<HTMLButtonElement>();
  const ghostRef = useRef<HTMLElement>(null);
  const cellRef = useRef<HTMLElement>(null);
  const [draft, setDraft] = useState<string | null>(null);

  const label = column.label ?? field?.label ?? column.path;
  const resize = useColumnResize({
    path: column.path, cellRef, onPreview: actions.onPreviewResize, onResize: actions.onResize,
  });
  const isDragging = drag.draggingPath === column.path;
  const placement = { index, from: drag.draggingIndex, over: drag.overIndex };
  const shift = columnDragShift(placement);
  const edge = dropEdgeAt(placement);
  /* Once the others have stepped aside, the gap they opened says where the
     column lands; a marker on the slot it left would say it a second time, in
     the wrong place, and from under whichever column has slid over it. */
  const vacated = isDragging && drag.overIndex !== drag.draggingIndex;
  useColumnShift({ cellRef, path: column.path, shift, carriedPath: drag.draggingPath });

  const commitRename = (): void => {
    if (draft !== null) actions.onRename(column.path, draft.trim());
    setDraft(null);
  };

  const handleRenameKey = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === 'Enter') commitRename();
    if (event.key === 'Escape') setDraft(null);
  };

  const classes = [
    'data-table__header-cell',
    isDragging && `data-table__header-cell--${vacated ? 'vacated' : 'dragging'}`,
    edge && `data-table__header-cell--drop-${edge}`,
    /* The menu is portalled, so the cursor leaves this cell to reach it. Its
       trigger has to stay shown for as long as what it opened is on screen. */
    menu.open && 'data-table__header-cell--menu-open',
    /* The caret that stays showing at rest, and the backing it needs to stay
       readable over a long name. Both are the CELL's business: the backing is
       the caret's own sibling, and no selector reaches sideways from a child. */
    sortDir && 'data-table__header-cell--sorted',
  ].filter(Boolean).join(' ');

  const handleDragStart = (event: DragEvent<HTMLElement>): void =>
    drag.onDragStart({ path: column.path, index, event, ghost: ghostRef.current });

  return (
    <Box
      ref={cellRef}
      className={classes}
      role="columnheader"
      /* Neither renaming nor resizing may double as picking the column up. */
      draggable={draft === null && !resize.resizing}
      title={column.path}
      data-column-head={column.path}
      onDragStart={handleDragStart}
      onDragOver={(event: DragEvent<HTMLElement>) => drag.onDragOver(index, event)}
      onDrop={(event: DragEvent<HTMLElement>) => drag.onDrop(index, event)}
      onDragEnd={drag.onDragEnd}
    >
      <ColumnDragGhost
        ref={ghostRef}
        label={label}
        path={column.path}
        field={field}
        rows={ghostRows}
        total={rowTotal}
      />
      {draft === null ? (
        <Text variant="label" className="data-table__header-label" data-column-label="">{label}</Text>
      ) : (
        <TextInput
          autoFocus
          value={draft}
          className="data-table__rename"
          aria-label={`Rename ${label}`}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleRenameKey}
          onBlur={commitRename}
        />
      )}
      <Box className="data-table__header-chrome">
        <Button
          variant="bare"
          size="sm"
          className="data-table__sort"
          aria-label={`Sort by ${label}`}
          onClick={() => actions.onToggleSort(column.path)}
        >
          <Text className={sortDir ? 'data-table__caret' : 'data-table__caret data-table__caret--off'}>
            {CARETS[sortDir ?? 'none']}
          </Text>
        </Button>
        <Button
          ref={menu.anchorRef}
          variant="bare"
          size="sm"
          className="data-table__menu-trigger"
          aria-label={`Column options for ${label}`}
          aria-haspopup="menu"
          aria-expanded={menu.open}
          onClick={menu.toggle}
        >
          ⋯
        </Button>
      </Box>
      {menu.open && (
        <ColumnMenu
          path={column.path}
          index={index}
          columnCount={columnCount}
          grouped={grouped}
          sortDir={sortDir}
          grow={column.grow}
          fit={column.fit}
          fieldNodes={fieldNodes}
          field={field}
          displayField={column.displayField}
          resolveTargetFields={resolveTargetFields}
          actions={actions}
          anchorRef={menu.anchorRef}
          onStartRename={() => setDraft(column.label ?? '')}
          onClose={menu.close}
        />
      )}
      <ColumnResizeHandle
        label={label}
        index={index}
        resize={resize}
        onDragOver={drag.onDragOver}
        onDrop={drag.onDrop}
      />
    </Box>
  );
};

export { HeaderCell };
export type { HeaderCellProps };
