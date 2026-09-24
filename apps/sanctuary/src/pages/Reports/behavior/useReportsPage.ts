/* @layer sanctuary-site @kind hook */
/**
 * All of the Reports page's state, so the component stays a layout: the list and the
 * scope tab (both shared through the site data, so they outlive the page), the schema, the view (clauses, search, saved views), the kinds facet, the
 * selected report and its actions. Selection is the route: `/reports/:id`.
 */
import { useCallback, useMemo, useState } from 'react';
import { navigate } from '../../../router/useLocation';
import { useSessionContext } from '../../../session/session-context';
import { useSiteData } from '../../../data/site-data-context';
import { toReportRow } from '../../../reports/report-row';
import { buildReportSchema } from '../../../reports/report-schema';
import { useSurfaceView } from '../../../views/useSurfaceView';
import { useFacet } from '../../../views/useFacet';
import { filterRows } from '../../../views/filter-rows';
import type { ReportRow } from '../../../reports/report-row';
import { scopePredicate, reportScopeTabs } from './report-scopes';
import { useReportActions } from './useReportActions';

const REPORTS_PATH = '/reports';

const kindOf = (row: ReportRow) => row.kind;

const useReportsPage = (selectedId: string | null) => {
  const { me, access } = useSessionContext();
  const meId = me?.id ?? '';
  const isAdmin = access?.state === 'admin';

  const { reports: data, scopes, setScope } = useSiteData();
  const scopeId = scopes.reports;
  const setScopeId = useCallback((id: string) => setScope('reports', id), [setScope]);
  // Read once per visit, so the tab counts and the filter agree on what "soon" is.
  const [now] = useState(() => Date.now());

  const inScope = useMemo(() => data.reports.filter(scopePredicate(scopeId, meId, now)), [data.reports, scopeId, meId, now]);
  const rows = useMemo(() => inScope.map(toReportRow), [inScope]);
  const allRows = useMemo(() => data.reports.map(toReportRow), [data.reports]);
  const schema = useMemo(() => buildReportSchema(allRows), [allRows]);
  const view = useSurfaceView('reports', schema);
  const kinds = useFacet({ id: 'kinds', label: 'Show kinds', rows: allRows, valueOf: kindOf });

  const shown = useMemo(
    () => kinds.apply(filterRows({ rows, schema, clauses: view.clauses, search: view.search })),
    [kinds, rows, schema, view.clauses, view.search],
  );

  const tabs = useMemo(() => reportScopeTabs(data.reports, meId, now), [data.reports, meId, now]);
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
