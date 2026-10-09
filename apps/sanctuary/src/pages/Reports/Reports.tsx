/* @layer sanctuary-site @kind component */
import { useMemo } from 'react';
import { Stack, Text } from '@drizztdourden08/tessera/primitives';
import { DataTable, FilterBar } from '@drizztdourden08/tessera/composites';
import { SitePage } from '@rotp/design';
import { Workbench } from '@rotp/design';
import { SavedViewsMenu } from '@rotp/design';
import { reportRowId } from '../../reports/report-row';
import { REPORT_DEFAULT_COLUMNS, REPORT_DEFAULT_GROUP_BY } from '../../reports/report-schema.constants';
import { useReportsPage } from './behavior/useReportsPage';
import { ReportDetail } from './sub-components/ReportDetail';
import { COUNT_LABEL, SEARCH_PLACEHOLDER } from './Reports.constants';
import type { ReportsProps } from './Reports.type';
import './Reports.css';

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
