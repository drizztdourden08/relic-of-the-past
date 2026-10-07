/* @layer renderer-components @kind component */
/**
 * One column header. Two gestures live on it: dragging the cell reorders
 * (HTML5 drag), dragging the seam resizes (pointer events); the seam swallows
 * its pointer events and the cell drops `draggable` during a resize. The caret
 * replaces the whole sort (asc, desc, none); the menu adds a level, the only
 * route to multi-column sort. Renaming is inline because a dropdown cannot
 * hold a text field. Stepping aside during a drag is measured, not a class;
 * see `useColumnShift`.
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
  /** The rows the offscreen ghost shows values from. Every header holds one ready. */
  ghostRows: readonly unknown[];
  /** Total rows in the table, so the ghost can say how many it left out. */
  rowTotal: number;
}

/* The small triangles: the caret sits on the label, so every unit of glyph
   width is a unit of name covered. */
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
  /* Once the others have stepped aside, a marker on the slot the column left
     would point at the wrong place. */
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
    /* The menu is portalled, so the trigger must stay shown while it is open. */
    menu.open && 'data-table__header-cell--menu-open',
    /* On the cell, not the caret: no selector reaches sideways to the backing. */
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
