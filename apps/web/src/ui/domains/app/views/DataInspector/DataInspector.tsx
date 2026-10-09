/* @layer renderer-app @kind component */
import { useMemo } from 'react';
import { Box } from '@drizztdourden08/tessera/primitives';
import { DataTable, FilterBar, ListDetailLayout, SideNav } from '@drizztdourden08/tessera/composites';
import { COMPARISON_TITLE, NO_FINDINGS, NOTHING_MATCHES } from './DataInspector.constants';
import { DATA_INSPECTOR_NAV } from './behavior/data-inspector-nav.constants';
import { buildDefaultColumns } from './behavior/default-table-columns';
import { resolveIdRefDisplayValue, resolveIdRefTargetFields } from './behavior/id-ref-display';
import { isEntityKind } from './behavior/is-entity-kind';
import { defaultIdRefDisplay } from './behavior/record-links';
import { RECOMMENDATION_GROUP_BY } from './behavior/recommendations/recommendation-source';
import { tableViewKey } from './behavior/table-view-key';
import { useDataInspector } from './behavior/useDataInspector';
import { useIdRefNavigation } from './behavior/useIdRefNavigation';
import { CollapsibleDetail } from './sub-components/CollapsibleDetail';
import { CreateRecordButton } from './sub-components/CreateRecordButton';
import { DetailTabs } from './sub-components/DetailTabs';
import { RecommendationDetail } from './sub-components/recommendations/RecommendationDetail';
import './DataInspector.css';

const DataInspector = () => {
  const {
    kind, showKind, source, schema, rows, entries,
    clauses, setClauses, search, setSearch, tab, setTab,
    selectedId, record, selectRecord, selectRecommendation, clearSelection, openIdRef,
    detailCollapsed, toggleDetail,
  } = useDataInspector();
  const { handleIdRefClickCapture } = useIdRefNavigation(openIdRef);
  const isCollection = isEntityKind(kind);

  const defaultColumns = useMemo(
    () => (source.config?.defaultColumns ? buildDefaultColumns(source.config.defaultColumns, schema) : undefined),
    [source, schema],
  );

  const list = (
    <>
      <Box className="data-inspector__list-actions">
        <FilterBar
          schema={schema}
          clauses={clauses}
          onChange={setClauses}
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search records..."
          searchLabel="Search records"
        />
        {isCollection && (
          <CreateRecordButton kind={kind} label={source.label} schema={schema} onCreated={selectRecord} />
        )}
      </Box>
      <DataTable
        rows={rows}
        schema={schema}
        getRowId={source.getId}
        viewKey={tableViewKey(kind)}
        fallbackColumns={defaultColumns}
        fallbackGroupBy={isCollection ? undefined : RECOMMENDATION_GROUP_BY}
        selectedId={selectedId}
        onSelect={selectRecord}
        emptyMessage={isCollection ? NOTHING_MATCHES : NO_FINDINGS}
        resolveTargetFields={resolveIdRefTargetFields}
        resolveIdRefDisplay={resolveIdRefDisplayValue}
        resolveIdRefDefault={defaultIdRefDisplay}
      />
    </>
  );

  const detail = (
    <CollapsibleDetail title={isCollection ? source.label : COMPARISON_TITLE} collapsed={detailCollapsed} onToggle={toggleDetail}>
      {isCollection
        ? (
          <DetailTabs
            source={source}
            schema={schema}
            record={record}
            tab={tab}
            onTabChange={setTab}
            onDeleted={clearSelection}
          />
        )
        : (
          <RecommendationDetail
            entries={entries}
            selectedId={selectedId}
            onSelect={selectRecommendation}
            tab={tab}
            onTabChange={setTab}
          />
        )}
    </CollapsibleDetail>
  );

  const folded = detailCollapsed;
  const comparing = !isCollection && !detailCollapsed;

  return (
    <Box className="data-inspector">
      <SideNav config={DATA_INSPECTOR_NAV} activeId={kind} onSelect={showKind} />
      <Box className="data-inspector__panes" onClickCapture={handleIdRefClickCapture}>
        <ListDetailLayout
          className={`data-inspector__master-detail${folded ? ' data-inspector__master-detail--folded' : ''}${comparing ? ' data-inspector__master-detail--comparing' : ''}`}
          list={list}
          detail={detail}
        />
      </Box>
    </Box>
  );
};

export { DataInspector };
