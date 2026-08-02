/* @layer renderer-app @kind component */
/**
 * Three readings of one record: what it is (JSON), what it would be written as
 * (the dataset's own emitter) and what can be changed about it (the schema-
 * derived form). Which tab is open is remembered per collection.
 */
import { useCallback, useMemo } from 'react';
import { Box, ScrollArea, TabBar, Text } from '@ds/primitives';
import { CodeBlock } from '@ds/composites/CodeBlock';
import { jsonSourceOf, tsSourceOf } from '../behavior/record-source-text';
import { RecordEditorPanel } from './RecordEditorPanel';
import type { TabItem } from '@ds/primitives';
import type { DetailTab, FieldDescriptor } from '@ds/data';
import type { InspectorRow, InspectorSource } from '../DataInspector.type';

const DETAIL_TABS: TabItem[] = [
  { id: 'json', label: 'JSON' },
  { id: 'ts', label: 'TypeScript' },
  { id: 'editor', label: 'Editor' },
];

const NOTHING_SELECTED = 'Select a record to inspect it.';

interface DetailTabsProps {
  source: InspectorSource;
  schema: readonly FieldDescriptor[];
  record?: InspectorRow;
  tab: DetailTab;
  onTabChange: (tab: DetailTab) => void;
  /** The record open in the editor was just deleted — nothing is selected anymore. */
  onDeleted: () => void;
}

const DetailTabs = (props: DetailTabsProps) => {
  const { source, schema, record, tab, onTabChange, onDeleted } = props;

  const handleTabChange = useCallback((id: string) => onTabChange(id as DetailTab), [onTabChange]);

  const code = useMemo(() => {
    if (!record || tab === 'editor') return '';
    return tab === 'ts' ? tsSourceOf(source, record) : jsonSourceOf(record);
  }, [record, source, tab]);

  if (!record) return <Text className="data-inspector__empty">{NOTHING_SELECTED}</Text>;

  return (
    <Box className="data-inspector__detail">
      <TabBar tabs={DETAIL_TABS} activeTab={tab} onTabChange={handleTabChange} />
      <ScrollArea className="data-inspector__detail-content">
        {tab === 'editor'
          ? <RecordEditorPanel source={source} schema={schema} record={record} onDeleted={onDeleted} />
          : <CodeBlock code={code} language={tab === 'ts' ? 'typescript' : 'json'} />}
      </ScrollArea>
    </Box>
  );
};

export { DetailTabs };
export type { DetailTabsProps };
