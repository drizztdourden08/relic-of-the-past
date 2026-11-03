/* @layer sanctuary-site @kind component */
import { Stack } from '@drizztdourden08/tessera/primitives';
import { DataTable } from '@drizztdourden08/tessera/composites';
import { reportRowId } from '../../reports/report-row';
import { REPORT_DEFAULT_COLUMNS, REPORT_DEFAULT_GROUP_BY } from '../../reports/report-schema.constants';
import { TablePage } from '../../components/TablePage';
import { useReportsPage } from './behavior/useReportsPage';
import { ReportDetail } from './sub-components/ReportDetail';
import { COUNT_LABEL, SEARCH_PLACEHOLDER } from './Reports.constants';
import type { ReportsProps } from './Reports.type';
import './Reports.css';

const Reports = (props: ReportsProps) => {
  const { selectedId = null } = props;
  const page = useReportsPage(selectedId);
  const { data, scope, view, selected } = page;

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

  const aside = selected && (
    <Stack as="aside" align="stretch" className="reports__aside">
      <ReportDetail key={selected.id} report={selected} isAdmin={page.isAdmin} actions={page.actions} onClose={page.deselect} />
    </Stack>
  );

  return (
    <TablePage
      section="reports"
      scope={scope}
      summary={`${page.shown.length} shown · ${scope.openCount} open`}
      error={data.error}
      filter={{ schema: page.schema, view, placeholder: SEARCH_PLACEHOLDER, label: 'Search reports' }}
      table={table}
      aside={aside}
    />
  );
};

export { Reports };
