/* @layer renderer-app @kind component */
import { Box } from '@drizztdourden08/tessera/primitives';
import { ListDetailLayout, SideNavLayout } from '@drizztdourden08/tessera/composites';
import { COMPARING_LIST_RATIO, COMPARISON_TITLE, RECORD_LIST_RATIO } from './DataInspector.constants';
import { DATA_INSPECTOR_NAV } from './behavior/data-inspector-nav.constants';
import { isEntityKind } from './behavior/is-entity-kind';
import { useDataInspector } from './behavior/useDataInspector';
import { useIdRefNavigation } from './behavior/useIdRefNavigation';
import { InspectorDetail } from './sub-components/InspectorDetail';
import { InspectorList } from './sub-components/InspectorList';
import './DataInspector.css';

const DataInspector = () => {
  const {
    kind, showKind, loading, source, schema, rows, entries,
    clauses, setClauses, search, setSearch, tab, setTab,
    selectedId, record, selectRecord, selectRecommendation, clearSelection, openIdRef,
    detailCollapsed, setDetailCollapsed,
  } = useDataInspector();
  const { handleIdRefClickCapture } = useIdRefNavigation(openIdRef);
  const isCollection = isEntityKind(kind);

  const list = (
    <InspectorList
      kind={kind}
      loading={loading}
      source={source}
      schema={schema}
      rows={rows}
      clauses={clauses}
      onClausesChange={setClauses}
      search={search}
      onSearchChange={setSearch}
      selectedId={selectedId}
      onSelect={selectRecord}
    />
  );

  const detail = (
    <InspectorDetail
      kind={kind}
      source={source}
      schema={schema}
      record={record}
      entries={entries}
      selectedId={selectedId}
      tab={tab}
      onTabChange={setTab}
      onDeleted={clearSelection}
      onSelectRecommendation={selectRecommendation}
    />
  );

  return (
    <SideNavLayout nav={{ config: DATA_INSPECTOR_NAV, activeId: kind, onSelect: showKind }} paneScroll="none" className="data-inspector">
      <Box className="data-inspector__panes" onClickCapture={handleIdRefClickCapture}>
        <ListDetailLayout
          listContainers={[{ title: isCollection ? source.label : 'Recommendations', content: list }]}
          detail={detail}
          listLabel="Data inspector"
          listShowTitle={false}
          listRatio={isCollection ? RECORD_LIST_RATIO : COMPARING_LIST_RATIO}
          collapsible
          detailCollapsible
          detailCollapsed={detailCollapsed}
          onDetailCollapsedChange={setDetailCollapsed}
          detailLabel={isCollection ? source.label : COMPARISON_TITLE}
          listScroll={false}
          detailScroll={false}
        />
      </Box>
    </SideNavLayout>
  );
};

export { DataInspector };
