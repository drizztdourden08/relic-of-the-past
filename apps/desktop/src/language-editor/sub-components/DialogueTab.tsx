/* @layer renderer-components @kind component */
import { useCallback } from 'react';
import { Box, Text, TextInput, EmptyState, SectionHeader, SegmentedControl } from '@drizztdourden08/tessera/primitives';
import { DialogueEntryRow } from './DialogueEntryRow';
import { FILTER_OPTIONS } from './DialogueTab.constants';
import type { ChangeEvent } from 'react';
import type { DialogueTabProps, EntryFilter } from './DialogueTab.type';
import './DialogueTab.css';

const DialogueTab = (props: DialogueTabProps) => {
  const { entries, total, query, filter, onQueryChange, onFilterChange, ...rowProps } = props;

  const handleQuery = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    onQueryChange(event.currentTarget.value);
  }, [onQueryChange]);

  const handleFilter = useCallback((value: string) => {
    onFilterChange(value as EntryFilter);
  }, [onFilterChange]);

  const searching = query.trim().length > 0 || filter !== 'all';
  const search = (
    <TextInput value={query} onChange={handleQuery} placeholder="Search all text..." />
  );

  return (
    <Box className="dialogue-tab">
      <SectionHeader
        title={searching ? `${entries.length} of ${total} lines` : `${total} lines`}
        action={search}
      />
      <Box className="dialogue-tab__filters">
        <SegmentedControl options={FILTER_OPTIONS} value={filter} onChange={handleFilter} />
      </Box>

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
