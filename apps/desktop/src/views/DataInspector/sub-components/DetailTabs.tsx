/* @layer renderer-app @kind component */
import { useCallback, useMemo } from 'react';
import { Box, ScrollArea, Tabs, Text } from '@drizztdourden08/tessera/primitives';
import { CodeBlock } from '@drizztdourden08/tessera/composites';
import type { DetailTab } from '@drizztdourden08/tessera/data';
import { DETAIL_TABS, NOTHING_SELECTED } from '../DataInspector.constants';
import type { DetailTabsProps } from '../DataInspector.type';
import { doNothing } from '../behavior/do-nothing';
import { jsonSourceOf } from '../behavior/json-source-of';
import { tsSourceOf } from '../behavior/ts-source-of';
import { RecordEditorPanel } from './RecordEditorPanel';

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
      <Tabs tabs={DETAIL_TABS} activeTab={tab} onTabChange={handleTabChange} />
      <ScrollArea className="data-inspector__detail-content" onScroll={onScroll} scrollTo={scrollTo}>
        {tab === 'editor'
          ? (editorSlot ?? (
            <RecordEditorPanel source={source} schema={schema} record={record} onDeleted={onDeleted ?? doNothing} />
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
