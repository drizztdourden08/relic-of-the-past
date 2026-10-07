/* @layer renderer-app @kind component */
/** One side of the comparison: a titled `DetailTabs`. The pairing lives in the props, so neither side knows the other exists. */
import { Box, Text } from '@ds/primitives';
import { DetailTabs } from '../DetailTabs';
import type { ReactNode } from 'react';
import type { DetailTab, FieldDescriptor } from '@ds/data';
import type { PaneScroll } from '../../behavior/recommendations/use-comparison-scroll';
import type { InspectorRow, InspectorSource } from '../../DataInspector.type';

interface ComparisonPaneProps {
  title: string;
  source: InspectorSource;
  schema: readonly FieldDescriptor[];
  /** Absent for the current side of a `create`, which has nothing there yet. */
  record?: InspectorRow;
  emptyMessage: string;
  tab: DetailTab;
  onTabChange: (tab: DetailTab) => void;
  highlightedLines: readonly number[];
  editorSlot: ReactNode;
  scroll: PaneScroll;
}

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
export type { ComparisonPaneProps };
