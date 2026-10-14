/* @layer renderer-app @kind component */
import type { InspectorDetailProps } from '../DataInspector.type';
import { isEntityKind } from '../behavior/is-entity-kind';
import { DetailTabs } from './DetailTabs';
import { RecommendationDetail } from './RecommendationDetail';

const InspectorDetail = (props: InspectorDetailProps) => {
  const {
    kind, source, schema, record, entries, selectedId, tab, onTabChange, onDeleted, onSelectRecommendation,
  } = props;

  if (isEntityKind(kind)) {
    return (
      <DetailTabs
        source={source}
        schema={schema}
        record={record}
        tab={tab}
        onTabChange={onTabChange}
        onDeleted={onDeleted}
      />
    );
  }

  return (
    <RecommendationDetail
      entries={entries}
      selectedId={selectedId}
      onSelect={onSelectRecommendation}
      tab={tab}
      onTabChange={onTabChange}
    />
  );
};

export { InspectorDetail };
