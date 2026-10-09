/* @layer renderer-app @kind component */
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import { DetailTabs } from '../DetailTabs';
import type { ComparisonPaneProps } from './RecommendationDetail.type';

const ComparisonPane = (props: ComparisonPaneProps) => {
  const {
    title, source, schema, record, emptyMessage, tab, onTabChange,
    highlightedLines, editorSlot, scroll,
  } = props;

  return (
    <Box className="rec-pane">
      <Text className="rec-pane__title">{title}</Text>
      <DetailTabs
        source={source}
        schema={schema}
        record={record}
        emptyMessage={emptyMessage}
        tab={tab}
        onTabChange={onTabChange}
        highlightedLines={highlightedLines}
        editorSlot={record ? editorSlot : undefined}
        onScroll={scroll.onScroll}
        scrollTo={scroll.scrollTo}
      />
    </Box>
  );
};

export { ComparisonPane };
