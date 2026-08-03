/* @layer renderer-app @kind component */
/**
 * Browses every collection in the game dataset through one set of generic,
 * schema-driven parts: nothing below is written per collection. The fields, the
 * filter operators, the cell renderers and the edit form are all derived from
 * the rows themselves, so a collection that gains a field gains a column, a
 * filter and a form row with no edit here.
 *
 * The one collection that is not a collection — recommendations — reuses every
 * one of those parts for its list and swaps only the DETAIL side, because a
 * finding is not a record to inspect but a change to compare (see
 * RecommendationDetail). It is reachable only while it is being shown, which is
 * why the rail's items are derived from the active kind.
 *
 * The other piece of real domain knowledge on this screen is the click handler:
 * id-reference cells publish what they point at as data attributes, and this
 * tier — which may know what the collections are — turns that into a jump.
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
const NO_FINDINGS = 'No open findings — the dataset agrees with everything seen so far.';
const COMPARISON = 'Comparison';

const DataInspector = () => {
  const {
    kind, showKind, source, schema, rows, entries,
    clauses, setClauses, tab, setTab,
    selectedId, record, selectRecord, selectRecommendation, clearSelection, openIdRef,
    detailCollapsed, toggleDetail,
  } = useDataInspector();
  const { handleIdRefClickCapture } = useIdRefNavigation(openIdRef);
  const isCollection = isEntityKind(kind);

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
        {/* A finding is minted by a detection pass, never created by hand. */}
        {isCollection && (
          <CreateRecordButton kind={kind} label={source.label} schema={schema} onCreated={selectRecord} />
        )}
      </Box>
      {/* The count is the table's own footer's business — it knows the rows. */}
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
        /* The reading half of the same handoff the click handler below is:
           the table offers to show a name in place of an id, and only this
           tier may look up what the other collection calls that record. */
        resolveTargetFields={resolveIdRefTargetFields}
        resolveIdRefDisplay={resolveIdRefDisplayValue}
        resolveIdRefDefault={defaultIdRefDisplay}
      />
    </>
  );

  // Every collection's detail pane folds the same way — a plain record just as
  // much as the recommendation comparison — so the wrapper is unconditional;
  // only what it wraps, and the title on its header, differ by kind.
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

  // The comparison needs the greater share of the width — it holds two records
  // side by side where a collection's detail holds one — until it is folded away.
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
