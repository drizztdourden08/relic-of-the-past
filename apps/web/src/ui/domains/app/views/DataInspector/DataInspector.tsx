/* @layer renderer-app @kind component */
/**
 * Browses every collection in the game dataset through one set of generic,
 * schema-driven parts: nothing below is written per collection. The fields, the
 * filter operators, the cell renderers and the edit form are all derived from
 * the rows themselves, so a collection that gains a field gains a column, a
 * filter and a form row with no edit here.
 *
 * The one piece of real domain knowledge on this screen is the click handler:
 * id-reference cells publish what they point at as data attributes, and this
 * tier — which may know what the collections are — turns that into a jump.
 */
import { useMemo } from 'react';
import { Box } from '@ds/primitives';
import { DataTable } from '@ds/composites/DataTable';
import { FilterBar } from '@ds/composites/FilterBar';
import { MasterDetailLayout } from '@ds/composites/MasterDetailLayout';
import { NavRail } from '@ds/composites/NavRail';
import { KIND_NAV_ITEMS, tableViewKey } from './DataInspector.constants';
import { buildDefaultColumns } from './behavior/default-table-columns';
import { resolveIdRefDisplayValue, resolveIdRefTargetFields } from './behavior/id-ref-display';
import { useDataInspector } from './behavior/useDataInspector';
import { useIdRefNavigation } from './behavior/useIdRefNavigation';
import { CreateRecordButton } from './sub-components/CreateRecordButton';
import { DetailTabs } from './sub-components/DetailTabs';
import './DataInspector.css';

const NOTHING_MATCHES = 'No records match these filters.';

const DataInspector = () => {
  const {
    kind, showKind, source, schema, rows,
    clauses, setClauses, tab, setTab,
    selectedId, record, selectRecord, clearSelection, openIdRef,
  } = useDataInspector();
  const { handleIdRefClickCapture } = useIdRefNavigation(openIdRef);

  /*
   * A collection with no curated column list (area, location) leaves this
   * undefined, which is exactly the signal DataTable already treats as "fall
   * back to the schema's own visible top level" — nothing more to do for those.
   */
  const defaultColumns = useMemo(
    () => (source.config?.defaultColumns ? buildDefaultColumns(source.config.defaultColumns, schema) : undefined),
    [source, schema],
  );

  const list = (
    <>
      <Box className="data-inspector__list-actions">
        <FilterBar schema={schema} clauses={clauses} onChange={setClauses} />
        <CreateRecordButton kind={kind} label={source.label} schema={schema} onCreated={selectRecord} />
      </Box>
      {/* The count is the table's own footer's business — it knows the rows. */}
      <DataTable
        rows={rows}
        schema={schema}
        getRowId={source.getId}
        viewKey={tableViewKey(kind)}
        fallbackColumns={defaultColumns}
        selectedId={selectedId}
        onSelect={selectRecord}
        emptyMessage={NOTHING_MATCHES}
        /* The reading half of the same handoff the click handler below is:
           the table offers to show a name in place of an id, and only this
           tier may look up what the other collection calls that record. */
        resolveTargetFields={resolveIdRefTargetFields}
        resolveIdRefDisplay={resolveIdRefDisplayValue}
      />
    </>
  );

  const detail = (
    <DetailTabs
      source={source}
      schema={schema}
      record={record}
      tab={tab}
      onTabChange={setTab}
      onDeleted={clearSelection}
    />
  );

  return (
    <Box className="data-inspector">
      <NavRail
        className="data-inspector__nav"
        items={KIND_NAV_ITEMS}
        activeId={kind}
        onSelect={showKind}
      />
      {/* One delegated listener covers every reference the composites render. */}
      <Box className="data-inspector__panes" onClickCapture={handleIdRefClickCapture}>
        <MasterDetailLayout
          className="data-inspector__master-detail"
          list={list}
          detail={detail}
          detailEmpty={!record}
        />
      </Box>
    </Box>
  );
};

export { DataInspector };
