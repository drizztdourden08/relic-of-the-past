/* @layer renderer-app @kind component */
/**
 * Three readings of one record: JSON, the dataset's own emitter output, and
 * the schema-derived form. Fully controlled, so two can run side by side in
 * the comparison view off one tab state and one scroll offset; the optional
 * slots (changed lines, scroll binding, a caller-supplied editor) exist for
 * that pairing.
 */
import { useCallback, useMemo } from 'react';
import { Box, ScrollArea, TabBar, Text } from '@ds/primitives';
import { CodeBlock } from '@ds/composites/CodeBlock';
import { jsonSourceOf, tsSourceOf } from '../behavior/record-source-text';
import { RecordEditorPanel } from './RecordEditorPanel';
import type { ReactNode } from 'react';
import type { ScrollPosition, TabItem } from '@ds/primitives';
import type { DetailTab, FieldDescriptor } from '@ds/data';
import type { InspectorRow, InspectorSource } from '../DataInspector.type';

const DETAIL_TABS: TabItem[] = [
  { id: 'json', label: 'JSON' },
  { id: 'ts', label: 'TypeScript' },
  { id: 'editor', label: 'Editor' },
];

const NOTHING_SELECTED = 'Select a record to inspect it.';

const NO_OP = (): void => {};

interface DetailTabsProps {
  source: InspectorSource;
  schema: readonly FieldDescriptor[];
  record?: InspectorRow;
  tab: DetailTab;
  onTabChange: (tab: DetailTab) => void;
  /** Called when the record open in the editor is deleted and nothing is selected. */
  onDeleted?: () => void;
  /** Shown in place of the record when there is none. */
  emptyMessage?: string;
  /** 1-indexed lines to mark as changed in the two code tabs. */
  highlightedLines?: readonly number[];
  /** Replaces the built-in editor, for a pane that must not write or delete. */
  editorSlot?: ReactNode;
  onScroll?: (position: ScrollPosition) => void;
  scrollTo?: Partial<ScrollPosition>;
}

const DetailTabs = (props: DetailTabsProps) => {
  const {
    source, schema, record, tab, onTabChange, onDeleted,
    emptyMessage = NOTHING_SELECTED, highlightedLines, editorSlot, onScroll, scrollTo,
  } = props;

  const handleTabChange = useCallback((id: string) => onTabChange(id as DetailTab), [onTabChange]);

  const code = useMemo(() => {
    if (!record || tab === 'editor') return '';
    return tab === 'ts' ? tsSourceOf(source, record) : jsonSourceOf(record);
  }, [record, source, tab]);

  if (!record) return <Text className="data-inspector__empty">{emptyMessage}</Text>;

  return (
    <Box className="data-inspector__detail">
      <TabBar tabs={DETAIL_TABS} activeTab={tab} onTabChange={handleTabChange} />
      <ScrollArea className="data-inspector__detail-content" onScroll={onScroll} scrollTo={scrollTo}>
        {tab === 'editor'
          ? (editorSlot ?? (
            <RecordEditorPanel source={source} schema={schema} record={record} onDeleted={onDeleted ?? NO_OP} />
          ))
          : (
            <CodeBlock
              code={code}
              language={tab === 'ts' ? 'typescript' : 'json'}
              highlightedLines={highlightedLines}
            />
          )}
      </ScrollArea>
    </Box>
  );
};

export { DetailTabs };
export type { DetailTabsProps };
