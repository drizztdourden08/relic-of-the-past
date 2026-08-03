/* @layer renderer-app @kind component */
/**
 * Three readings of one record: what it is (JSON), what it would be written as
 * (the dataset's own emitter) and what can be changed about it (the schema-
 * derived form). Which tab is open is remembered per collection.
 *
 * Fully controlled, which is what lets two of these run side by side in the
 * comparison view off ONE tab state and ONE scroll offset — the pair needs no
 * synchronisation mechanism of its own, only the same props. The three optional
 * slots below exist for that pairing: lines to mark as changed, a scroll
 * binding, and an editor supplied by the caller when the built-in one (which
 * writes to the dataset and can delete) is not what the pane means.
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
  /** The record open in the editor was just deleted — nothing is selected anymore. */
  onDeleted?: () => void;
  /** Shown in place of the record when there is none. */
  emptyMessage?: string;
  /** 1-indexed lines to mark as changed in the two code tabs. */
  highlightedLines?: readonly number[];
  /** Replaces the built-in editor — a pane that must not write or delete. */
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
