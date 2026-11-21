/* @layer renderer-components @kind component */
import { Box, Text, EmptyState, SectionHeader } from '@drizztdourden08/tessera/primitives';
import { useT } from '@drizztdourden08/brock-react';
import { DialogueEntryRow } from './DialogueEntryRow';
import type { DialogueTabProps } from './DialogueTab.type';
import './DialogueTab.css';

const DialogueTab = (props: DialogueTabProps) => {
  const { entries, total, query, filter, ...rowProps } = props;
  const t = useT();

  const searching = query.trim().length > 0 || filter !== 'all';
  const title = searching
    ? t('language-editor:dialogue.count-filtered', { shown: entries.length, total })
    : t('language-editor:dialogue.count', { total });

  return (
    <Box className="dialogue-tab">
      <SectionHeader title={title} />

      <Box className="dialogue-tab__scroll">
        {entries.length === 0 && (
          <EmptyState message={searching ? t('language-editor:dialogue.empty-search') : t('language-editor:dialogue.empty')} />
        )}
        {entries.map((entry) => <DialogueEntryRow key={entry.id} entry={entry} {...rowProps} />)}
      </Box>

      {!rowProps.cfg && (
        <Text className="dialogue-tab__hint" variant="caption">
          {t('language-editor:dialogue.unknown-base')}
        </Text>
      )}
    </Box>
  );
};

export { DialogueTab };
