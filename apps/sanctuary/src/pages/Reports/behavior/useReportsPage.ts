/* @layer sanctuary-site @kind hook */
import { useCallback, useMemo, useState } from 'react';
import { navigate } from '@site-kit/router/useLocation';
import { useSessionContext } from '@site-kit/session/session-context';
import { useSiteData } from '../../../data/useSiteData';
import { toReportRow } from '../../../reports/report-row';
import { buildReportSchema } from '../../../reports/report-schema';
import { useSurfaceView } from '@site-kit/views/useSurfaceView';
import { SANCTUARY_VIEWS } from '../../../views/sanctuary-views.constants';
import { useFacet } from '@site-kit/views/useFacet';
import { filterRows } from '@site-kit/views/filter-rows';
import type { ReportRow } from '../../../reports/report-row';
import { scopePredicate, reportScopeTabs } from './report-scopes';
import { useReportActions } from './useReportActions';
import { REPORTS_PATH } from './useReportsPage.constants';

const kindOf = (row: ReportRow) => row.kind;

const useReportsPage = (selectedId: string | null) => {
  const { me, access } = useSessionContext();
  const meId = me?.id ?? '';
  const isAdmin = access?.state === 'admin';

  const { reports: data, scopes, setScope } = useSiteData();
  const scopeId = scopes.reports;
  const setScopeId = useCallback((id: string) => setScope('reports', id), [setScope]);
  const [visitedAt] = useState(() => Date.now());

  const inScope = useMemo(
    () => data.reports.filter(scopePredicate(scopeId, meId, visitedAt)),
    [data.reports, scopeId, meId, visitedAt],
  );
  const rows = useMemo(() => inScope.map(toReportRow), [inScope]);
  const allRows = useMemo(() => data.reports.map(toReportRow), [data.reports]);
  const schema = useMemo(() => buildReportSchema(allRows), [allRows]);
  const view = useSurfaceView(SANCTUARY_VIEWS, 'reports', schema);
  const kinds = useFacet({ id: 'kinds', label: 'Show kinds', rows: allRows, valueOf: kindOf });

  const shown = useMemo(
    () => kinds.apply(filterRows({ rows, schema, clauses: view.clauses, search: view.search })),
    [kinds, rows, schema, view.clauses, view.search],
  );

  const tabs = useMemo(() => reportScopeTabs(data.reports, meId, visitedAt), [data.reports, meId, visitedAt]);
  const openCount = useMemo(() => inScope.filter((report) => report.issue.state === 'open').length, [inScope]);

  const selected = useMemo(
    () => data.reports.find((report) => report.id === selectedId) ?? null,
    [data.reports, selectedId],
  );
  const select = useCallback((id: string) => navigate(`${REPORTS_PATH}/${id}`, { replace: true }), []);
  const deselect = useCallback(() => navigate(REPORTS_PATH, { replace: true }), []);

  const { replace, remove } = data;
  const onDeleted = useCallback((id: string) => {
    remove(id);
    deselect();
  }, [remove, deselect]);
  const actions = useReportActions({ onExtended: replace, onDeleted });

  return {
    data,
    scope: { tabs, activeId: scopeId, select: setScopeId, openCount },
    schema,
    view,
    facets: [kinds.facet],
    shown,
    selected,
    select,
    deselect,
    actions,
    isAdmin,
  };
};

export { useReportsPage };
