/* @layer renderer-app @kind component */
/**
 * Every part here is schema-driven and derived from the rows: nothing is written
 * per collection. Recommendations reuse the list and swap only the detail side
 * (see RecommendationDetail). Id-reference cells publish their target as data
 * attributes; this tier, which knows the collections, turns that into a jump.
 */
import { useMemo } from 'react';
import { Box } from '@ds/primitives';
import { DataTable } from '@ds/composites/DataTable';
import { FilterBar } from '@ds/composites/FilterBar';
import { MasterDetailLayout } from '@ds/composites/MasterDetailLayout';
import { NavRail } from '@ds/composites/NavRail';
import { NAV_ITEMS, isEntityKind, tableViewKey } from './DataInspector.constants';
import { buildDefaultColumns } from './behavior/default-table-columns';
import { resolveIdRefDisplayValue, resolveIdRefTargetFields } from './behavior/id-ref-display';
import { defaultIdRefDisplay } from './behavior/record-links';
import { RECOMMENDATION_GROUP_BY } from './behavior/recommendations/recommendation-source';
import { useDataInspector } from './behavior/useDataInspector';
import { useIdRefNavigation } from './behavior/useIdRefNavigation';
import { CollapsibleDetail } from './sub-components/CollapsibleDetail';
import { CreateRecordButton } from './sub-components/CreateRecordButton';
import { DetailTabs } from './sub-components/DetailTabs';
import { RecommendationDetail } from './sub-components/recommendations/RecommendationDetail';
import './DataInspector.css';
import './sub-components/recommendations/Recommendations.css';

const NOTHING_MATCHES = 'No records match these filters.';
const NO_FINDINGS = 'No open findings. The dataset agrees with everything seen so far.';
const COMPARISON = 'Comparison';

const DataInspector = () => {
  const {
    kind, showKind, source, schema, rows, entries,
    clauses, setClauses, search, setSearch, tab, setTab,
    selectedId, record, selectRecord, selectRecommendation, clearSelection, openIdRef,
    detailCollapsed, toggleDetail,
  } = useDataInspector();
  const { handleIdRefClickCapture } = useIdRefNavigation(openIdRef);
  const isCollection = isEntityKind(kind);

  // Undefined for collections with no curated column list (area, location):
  // DataTable then falls back to the schema's own visible top level.
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
          searchPlaceholder="Search records…"
          searchLabel="Search records"
        />
        {/* A finding is minted by a detection pass, never created by hand. */}
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
        /* Only this tier may look up what another collection calls a record. */
        resolveTargetFields={resolveIdRefTargetFields}
        resolveIdRefDisplay={resolveIdRefDisplayValue}
        resolveIdRefDefault={defaultIdRefDisplay}
      />
    </>
  );

  const detail = (
    <CollapsibleDetail title={isCollection ? source.label : COMPARISON} collapsed={detailCollapsed} onToggle={toggleDetail}>
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

  // The comparison holds two records side by side, so it needs more width until folded.
  const folded = detailCollapsed;
  const comparing = !isCollection && !detailCollapsed;

  return (
    <Box className="data-inspector">
      <NavRail
        className="data-inspector__nav"
        items={NAV_ITEMS}
        activeId={kind}
        onSelect={showKind}
      />
      {/* One delegated listener covers every reference the composites render. */}
      <Box className="data-inspector__panes" onClickCapture={handleIdRefClickCapture}>
        <MasterDetailLayout
          className={`data-inspector__master-detail${folded ? ' data-inspector__master-detail--folded' : ''}${comparing ? ' data-inspector__master-detail--comparing' : ''}`}
          list={list}
          detail={detail}
          detailEmpty={isCollection && !record}
        />
      </Box>
    </Box>
  );
};

export { DataInspector };
