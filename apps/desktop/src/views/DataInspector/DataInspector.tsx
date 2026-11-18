/* @layer renderer-app @kind component */
import { useMemo } from 'react';
import { useT, useText } from '@drizztdourden08/brock-react';
import { Box } from '@drizztdourden08/tessera/primitives';
import { ListDetailLayout, SideNavLayout } from '@drizztdourden08/tessera/composites';
import { COMPARING_LIST_RATIO, COMPARISON_TITLE, KIND_LABELS, RECORD_LIST_RATIO } from './DataInspector.constants';
import { dataInspectorNav } from './behavior/data-inspector-nav.constants';
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
  const t = useT();
  const text = useText();
  const nav = useMemo(() => dataInspectorNav(text), [text]);
  const label = text(KIND_LABELS[kind]);
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
    <SideNavLayout nav={{ config: nav, activeId: kind, onSelect: showKind }} paneScroll="none" className="data-inspector">
      <Box className="data-inspector__panes" onClickCapture={handleIdRefClickCapture}>
        <ListDetailLayout
          listContainers={[{ title: label, content: list }]}
          detail={detail}
          listLabel={t('views-data-inspector:list.title')}
          listShowTitle={false}
          listRatio={isCollection ? RECORD_LIST_RATIO : COMPARING_LIST_RATIO}
          collapsible
          detailCollapsible
          detailCollapsed={detailCollapsed}
          onDetailCollapsedChange={setDetailCollapsed}
          detailLabel={isCollection ? label : text(COMPARISON_TITLE)}
          listScroll={false}
          detailScroll={false}
        />
      </Box>
    </SideNavLayout>
  );
};

export { DataInspector };
