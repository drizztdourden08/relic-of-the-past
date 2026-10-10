/* @layer sanctuary-site @kind hook */
import { createElement, useCallback, useMemo } from 'react';
import { Icon as IconifyIcon } from '@iconify/react/offline';
import { Box } from '@drizztdourden08/tessera/primitives';
import { DataTable } from '@drizztdourden08/tessera/composites';
import type { DataTableProps, SearchResultsGroup, SearchResultsJump } from '@drizztdourden08/tessera/composites';
import { fileRowId } from '../../../files/file-row';
import { FILE_DEFAULT_COLUMNS } from '../../../files/file-schema.constants';
import { reportRowId } from '../../../reports/report-row';
import { REPORT_DEFAULT_COLUMNS, REPORT_DEFAULT_GROUP_BY } from '../../../reports/report-schema.constants';
import type { SearchCategory } from '../../search-categories';
import { FILE_COUNT, REPORT_COUNT } from '../SearchResults.constants';
import type { SearchResultsState } from './useSearchResults.type';

const iconOf = (category: SearchCategory) => createElement(IconifyIcon, { icon: category.icon });

const headOf = (category: SearchCategory, count: number) => ({ id: category.key, label: category.label, icon: iconOf(category), count });

const tableOf = <Row extends object>(props: DataTableProps<Row>) => createElement(Box, { className: 'site-search__table' }, createElement(DataTable<Row>, props));

const useResultView = (results: SearchResultsState) => {
  const { fileGroups, reportGroups, named, open } = results;

  const groups = useMemo<SearchResultsGroup[]>(() => [
    ...fileGroups.map(({ category, rows }) => ({
      ...headOf(category, rows.length),
      children: tableOf({
        rows,
        schema: results.fileSchema,
        getRowId: fileRowId,
        fallbackColumns: FILE_DEFAULT_COLUMNS,
        onSelect: (id: string) => open(category, id),
        countLabel: FILE_COUNT,
      }),
    })),
    ...reportGroups.map(({ category, rows }) => ({
      ...headOf(category, rows.length),
      children: tableOf({
        rows,
        schema: results.reportSchema,
        getRowId: reportRowId,
        fallbackColumns: REPORT_DEFAULT_COLUMNS,
        fallbackGroupBy: REPORT_DEFAULT_GROUP_BY,
        onSelect: (id: string) => open(category, id),
        countLabel: REPORT_COUNT,
      }),
    })),
  ], [fileGroups, reportGroups, results.fileSchema, results.reportSchema, open]);

  const jumps = useMemo<SearchResultsJump[]>(
    () => named.map((category) => ({ id: category.key, label: category.label, icon: iconOf(category) })),
    [named],
  );

  const byKey = useMemo(() => {
    const all = [...named, ...fileGroups.map((group) => group.category), ...reportGroups.map((group) => group.category)];
    return new Map(all.map((category) => [category.key, category]));
  }, [named, fileGroups, reportGroups]);

  const openKey = useCallback((key: string) => {
    const category = byKey.get(key);
    if (category) open(category);
  }, [byKey, open]);

  return { groups, jumps, openKey };
};

export { useResultView };
