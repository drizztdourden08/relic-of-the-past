/* @layer renderer-app @kind hook */
import { useCallback, useMemo, useState } from 'react';
import { ROW_PAGE_SIZE } from '../DataInspector.constants';
import type { RowWindow } from '../DataInspector.type';
import { reachFor } from './reach-for';
import { orderedRows } from './windowed-rows';
import type { LimitState, WindowedRowsParams } from './useWindowedRows.type';

const useWindowedRows = (params: WindowedRowsParams): RowWindow => {
  const { rows, schema, order, selectedId, getId, enabled } = params;
  const [state, setState] = useState<LimitState>({ rows, limit: ROW_PAGE_SIZE });
  const requested = state.rows === rows ? state.limit : ROW_PAGE_SIZE;

  const ordered = useMemo(
    () => (enabled ? orderedRows(rows, schema, order) : rows),
    [enabled, rows, schema, order],
  );
  const reach = useMemo(() => reachFor(ordered, selectedId, getId), [ordered, selectedId, getId]);
  const limit = Math.max(requested, reach);
  const shown = useMemo(() => (enabled ? ordered.slice(0, limit) : ordered), [enabled, ordered, limit]);

  const showMore = useCallback(() => setState({ rows, limit: limit + ROW_PAGE_SIZE }), [rows, limit]);
  const showAll = useCallback(() => setState({ rows, limit: ordered.length }), [rows, ordered.length]);

  return { shown, total: ordered.length, showMore, showAll };
};

export { useWindowedRows };
