/* @layer renderer-components @kind component */
import { Box, Text, EmptyState, SectionHeader } from '@drizztdourden08/tessera/primitives';
import { DialogueEntryRow } from './DialogueEntryRow';
import type { DialogueTabProps } from './DialogueTab.type';
import './DialogueTab.css';

const DialogueTab = (props: DialogueTabProps) => {
  const { entries, total, query, filter, ...rowProps } = props;

  const searching = query.trim().length > 0 || filter !== 'all';

  return (
    <Box className="dialogue-tab">
      <SectionHeader title={searching ? `${entries.length} of ${total} lines` : `${total} lines`} />

      <Box className="dialogue-tab__scroll">
        {entries.length === 0 && (
          <EmptyState message={searching ? 'No line matches' : 'This set has no dialogue'} />
        )}
        {entries.map((entry) => <DialogueEntryRow key={entry.id} entry={entry} {...rowProps} />)}
      </Box>

      {!rowProps.cfg && (
        <Text className="dialogue-tab__hint" variant="caption">
          This set names a base language the app does not know, so editing is unavailable.
        </Text>
      )}
    </Box>
  );
};

export { DialogueTab };
