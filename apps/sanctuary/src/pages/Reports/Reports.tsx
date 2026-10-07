/* @layer sanctuary-site @kind component */
/**
 * Reports: the scope tabs in the header, then the open count, the FilterBar and the
 * DataTable grouped by issue state, with the selected report's detail on the right.
 * Everything stateful lives in useReportsPage.
 */
import { useMemo } from 'react';
import { Stack } from '@ds/primitives/Stack';
import { Text } from '@ds/primitives/Text';
import { DataTable } from '@ds/composites/DataTable';
import { FilterBar } from '@ds/composites/FilterBar';
import { SitePage } from '../../layout/SitePage/SitePage';
import { Workbench } from '../../layout/Workbench/Workbench';
import { SavedViewsMenu } from '../../views/SavedViewsMenu';
import { reportRowId } from '../../reports/report-row';
import { REPORT_DEFAULT_COLUMNS, REPORT_DEFAULT_GROUP_BY } from '../../reports/report-schema';
import { useReportsPage } from './behavior/useReportsPage';
import { ReportDetail } from './sub-components/ReportDetail';
import './Reports.css';

type ReportsProps = {
  /** From the `/reports/:id` route; selects that row. */
  selectedId?: string;
};

const COUNT_LABEL = ['report', 'reports'] as const;
const SEARCH_PLACEHOLDER = 'Search subject, reporter, issue...';

const Reports = (props: ReportsProps) => {
  const { selectedId = null } = props;
  const page = useReportsPage(selectedId);
  const { data, scope, view, selected } = page;
  const headerTabs = useMemo(
    () => ({ items: scope.tabs, activeId: scope.activeId, onSelect: scope.select }),
    [scope.tabs, scope.activeId, scope.select],
  );

  const toolbar = (
    <>
      <FilterBar
        schema={page.schema}
        clauses={view.clauses}
        onChange={view.setClauses}
        search={view.search}
        onSearchChange={view.setSearch}
        searchPlaceholder={SEARCH_PLACEHOLDER}
        searchLabel="Search reports"
        facets={page.facets}
      />
      <SavedViewsMenu state={view.savedViews} />
    </>
  );

  const table = (
    <DataTable
      rows={page.shown}
      schema={page.schema}
      getRowId={reportRowId}
      viewKey={view.tableKey}
      viewStorage={view.storage}
      fallbackColumns={REPORT_DEFAULT_COLUMNS}
      fallbackGroupBy={REPORT_DEFAULT_GROUP_BY}
      selectedId={selectedId}
      onSelect={page.select}
      countLabel={COUNT_LABEL}
      emptyMessage={data.loading ? 'Loading reports...' : 'No report matches.'}
    />
  );

  const detail = selected && (
    <ReportDetail key={selected.id} report={selected} isAdmin={page.isAdmin} actions={page.actions} onClose={page.deselect} />
  );

  return (
    <SitePage section="reports" tabs={headerTabs} scroll={false}>
      <Stack gap="md" align="stretch" className="reports">
        <Text as="span" variant="caption" className="reports__summary">
          {page.shown.length} shown · {scope.openCount} open
        </Text>
        {data.error && <Text as="p" variant="caption" role="alert">{data.error}</Text>}
        <Workbench toolbar={toolbar} table={table} detail={detail} />
      </Stack>
    </SitePage>
  );
};

export { Reports };
export type { ReportsProps };
