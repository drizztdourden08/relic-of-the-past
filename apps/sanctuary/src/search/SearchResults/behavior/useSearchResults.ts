/* @layer sanctuary-site @kind hook */
/**
 * What the search pane draws for a query: the matching files and reports as table rows
 * under their category, the categories named by the query, the schemas the list pages
 * use, and the moves out of the search (open a category, open a row), each of which
 * ends the search. Categories and reports follow the caller's rights.
 */
import { useCallback, useMemo } from 'react';
import { navigate } from '../../../router/useLocation';
import { useSiteData } from '../../../data/site-data-context';
import { useSessionContext } from '../../../session/session-context';
import { canSeeReports, visibleFileTypes } from '../../../session/rights';
import { toFileRow } from '../../../files/file-row';
import { buildFileSchema } from '../../../files/file-schema';
import { toReportRow } from '../../../reports/report-row';
import { buildReportSchema } from '../../../reports/report-schema';
import type { FileRow } from '../../../files/file-row';
import type { ReportRow } from '../../../reports/report-row';
import { matchFiles } from '../../match-files';
import { matchReports } from '../../match-reports';
import { FILE_CATEGORIES, REPORT_CATEGORIES, categoriesNamed } from '../../search-categories';
import type { SearchCategory } from '../../search-categories';

type ResultGroup<Row> = { category: SearchCategory; rows: Row[] };

const useSearchResults = (query: string, onDone: () => void) => {
  const { files, reports, setScope } = useSiteData();
  const { rights } = useSessionContext();
  const reportsAllowed = canSeeReports(rights);
  const categoryRights = useMemo(
    () => ({ types: visibleFileTypes(rights), reports: reportsAllowed }),
    [rights, reportsAllowed],
  );

  const fileSchema = useMemo(() => buildFileSchema(files.files.map(toFileRow)), [files.files]);
  const reportSchema = useMemo(() => buildReportSchema(reports.reports.map(toReportRow)), [reports.reports]);

  const fileGroups = useMemo<ResultGroup<FileRow>[]>(
    () => matchFiles(files.files, query)
      .filter((group) => categoryRights.types.includes(group.type))
      .map((group) => ({ category: FILE_CATEGORIES[group.type], rows: group.files.map(toFileRow) })),
    [files.files, query, categoryRights],
  );
  const reportGroups = useMemo<ResultGroup<ReportRow>[]>(
    () => (reportsAllowed ? matchReports(reports.reports, query) : []).map((group) => ({
      category: REPORT_CATEGORIES[group.kind],
      rows: group.reports.map(toReportRow),
    })),
    [reports.reports, query, reportsAllowed],
  );
  const named = useMemo(() => categoriesNamed(query, categoryRights), [query, categoryRights]);
  const total = [...fileGroups, ...reportGroups].reduce((sum, group) => sum + group.rows.length, 0);

  /** Opens the category's page on its tab, or one row of it when an id is given. */
  const open = useCallback((category: SearchCategory, id?: string) => {
    setScope(category.surface, category.scope);
    navigate(id === undefined ? category.path : `${category.path}/${id}`);
    onDone();
  }, [setScope, onDone]);

  return {
    fileGroups,
    reportGroups,
    named,
    total,
    fileSchema,
    reportSchema,
    loading: files.loading || reports.loading,
    open,
  };
};

export { useSearchResults };
export type { ResultGroup };
