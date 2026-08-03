/* @layer renderer-components @kind component */
/**
 * The presentational half of the headless-hook pair: it renders what
 * `useDataTable` produced and binds each control back onto it. No sorting,
 * grouping or column transform is reimplemented here — every action below is a
 * one-line call into the hook, and `useViewState` owns whether any of it is
 * remembered.
 *
 * Give it a `viewKey` and the layout survives a restart; leave it off and the
 * table is exactly as usable, purely in memory.
 */
import { useMemo } from 'react';
import { Box } from '../../primitives/Box';
import { Text } from '../../primitives/Text';
import { createSchemaIndex } from '../../data/schema/build-schema';
import { GHOST_ROW_LIMIT, trackList } from './DataTable.constants';
import { columnLabelsOf } from './behavior/column-labels';
import { buildPickerNodes } from './behavior/field-picker-nodes';
import { ghostRowSample } from './behavior/ghost-row-sample';
import { useColumnDrag } from './behavior/use-column-drag';
import { TRACKS_PROPERTY, useColumnSizing } from './behavior/use-column-sizing';
import { useExpandedGroups } from './behavior/use-expanded-groups';
import { useTableView } from './behavior/use-table-view';
import { ColumnDropTrash } from './sub-components/ColumnDropTrash';
import { HeaderRow } from './sub-components/HeaderRow';
import { RowTree } from './sub-components/RowTree';
import { TableFooter } from './sub-components/TableFooter';
import type { CSSProperties } from 'react';
import type {
  ColumnActions, DataTableProps, RowRenderContext, TableActions,
} from './DataTable.type';
import './DataTable.css';

const DataTable = <T,>(props: DataTableProps<T>) => {
  const {
    rows, schema, getRowId, viewKey, fallbackColumns, fallbackGroupBy,
    onSelect, selectedId, countLabel, emptyMessage = 'Nothing to show.',
    resolveTargetFields, resolveIdRefDisplay, resolveIdRefDefault,
  } = props;

  const { table, sessionView, setSessionView } = useTableView({ rows, schema, viewKey, fallbackColumns, fallbackGroupBy });
  const index = useMemo(() => createSchemaIndex(schema), [schema]);

  const groups = useExpandedGroups({
    groupedRows: table.groupedRows,
    groupBy: table.groupBy,
    sessionView,
    setSessionView,
  });
  const drag = useColumnDrag(table.reorderColumn);
  const sizing = useColumnSizing({ columns: table.columns, onResize: table.resizeColumn });

  /*
   * The addable fields, walked once and handed to every menu that offers them:
   * each column's ⋯ (before / after) and the footer's (append). The columns on
   * screen are what it leaves out, so the tree narrows as the table fills up.
   */
  const fieldNodes = useMemo(
    () => buildPickerNodes(schema, table.columns.map((column) => column.path)),
    [schema, table.columns],
  );

  const actions: ColumnActions = useMemo(() => ({
    onToggleSort: table.setSingleSort,
    onSortDir: table.setSortDir,
    onRemoveSort: table.removeSort,
    onAddColumnAt: table.insertColumn,
    onRemove: table.removeColumn,
    onMove: table.moveColumn,
    onRename: table.renameColumn,
    onGroupBy: table.addGroupBy,
    onUngroup: table.removeGroupBy,
    onResize: table.resizeColumn,
    onPreviewResize: sizing.previewWidth,
    onFitToContent: table.fitColumn,
    onExpandToFill: table.growColumn,
    onSetDisplayField: table.setDisplayField,
  }), [table, sizing.previewWidth]);

  /* Table-wide, so they appear once in the footer rather than in every column. */
  const tableActions: TableActions = useMemo(() => ({
    onAddColumn: table.addColumn,
    onClearSort: table.clearSort,
    onClearGroupBy: table.clearGroupBy,
    onFitAllToContent: table.fitAllColumns,
    onResetColumns: table.resetColumns,
  }), [table]);

  /*
   * One track list for the header and every row, published as a custom property
   * they all inherit. A resize drag writes the same property straight onto this
   * element while it runs, which is why it can preview without a render.
   *
   * Both fallbacks ride along rather than being folded into the column list: a
   * grow column with no slack to take renders at its content width and stays a
   * grow column, so it fills again by itself the moment slack comes back; a
   * fit column renders at whatever it last measured and stays a fit column.
   */
  const gridStyle = useMemo(
    () => ({
      [TRACKS_PROPERTY]: trackList(table.columns, sizing.growFallback, sizing.fitFallback),
    } as CSSProperties),
    [table.columns, sizing.growFallback, sizing.fitFallback],
  );

  /*
   * Sampled here, once, rather than per header: the rows are the same for every
   * column and the ghosts have to be standing by before a drag can start.
   */
  const ghostRows = useMemo(
    () => ghostRowSample({
      nodes: table.groupedRows, isExpanded: groups.isExpanded, limit: GHOST_ROW_LIMIT,
    }),
    [table.groupedRows, groups.isExpanded],
  );

  /* The table's sort/group summary (for the footer) and the carried column's
     own name (for the drop target), both spelled with any rename applied. */
  const { summary, carriedLabel } = columnLabelsOf({
    columns: table.columns, schema: index, sort: table.sort, groupBy: table.groupBy,
    draggingPath: drag.draggingPath,
  });

  const context: RowRenderContext<T> = useMemo(() => ({
    columns: table.columns,
    schema: index,
    draggingPath: drag.draggingPath,
    getRowId,
    selectedId,
    onSelect,
    isExpanded: groups.isExpanded,
    onToggleGroup: groups.toggle,
    /*
     * Both are stable for the length of a drag — the hovered index deliberately
     * does not travel down here, so a body-cell dragover updates the header
     * chrome without re-rendering a single row.
     */
    onCellDragOver: drag.onDragOver,
    onCellDrop: drag.onDrop,
    resolveIdRefDisplay,
    resolveIdRefDefault,
  }), [
    table.columns, index, drag.draggingPath, drag.onDragOver, drag.onDrop,
    getRowId, selectedId, onSelect, groups, resolveIdRefDisplay, resolveIdRefDefault,
  ]);

  return (
    <Box className="data-table">
      {/* The scroller is the drag's backstop: every cell in it names a column,
          and the bare grid between them — the gap the displaced columns open —
          would otherwise refuse the release outright. See `onSurfaceHover`. */}
      <Box
        ref={sizing.rootRef}
        className="data-table__scroll"
        role="grid"
        style={gridStyle}
        onDragEnter={drag.onSurfaceHover}
        onDragOver={drag.onSurfaceHover}
        onDrop={drag.onSurfaceDrop}
      >
        <HeaderRow
          columns={table.columns}
          schema={index}
          fieldNodes={fieldNodes}
          sort={table.sort}
          groupBy={table.groupBy}
          resolveTargetFields={resolveTargetFields}
          actions={actions}
          drag={drag}
          ghostRows={ghostRows}
          rowTotal={table.sortedRows.length}
        />
        <RowTree nodes={table.groupedRows} parentUid="" context={context} />
        {rows.length === 0 && <Text className="data-table__empty">{emptyMessage}</Text>}
      </Box>
      {/* A plain child of this same container, absolutely positioned rather
          than portalled — see `ColumnDropTrash` for why. */}
      <ColumnDropTrash
        draggingPath={drag.draggingPath}
        label={carriedLabel}
        onRemove={actions.onRemove}
        onDragEnd={drag.onDragEnd}
      />
      <TableFooter
        count={rows.length}
        countLabel={countLabel}
        sortActive={table.sort.length > 0}
        groupActive={table.groupBy.length > 0}
        fieldNodes={fieldNodes}
        actions={tableActions}
        summary={summary}
      />
    </Box>
  );
};

export { DataTable };
