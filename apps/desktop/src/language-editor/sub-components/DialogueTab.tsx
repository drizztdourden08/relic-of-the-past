/* @layer renderer-components @kind component */
import { useCallback } from 'react';
import { Box, Text, TextInput, EmptyState, SectionHeader, SegmentedControl } from '@drizztdourden08/tessera/primitives';
import { structuralEntry } from '@rotp/languages';
import { EntryEditor } from './EntryEditor';
import { LockedEntryCard } from './LockedEntryCard';
import { EntryListItem, PreviewView } from '@rotp/design/packs';
import { FILTER_OPTIONS } from './DialogueTab.constants';
import type { ChangeEvent } from 'react';
import type { DialogueTabProps, EntryFilter } from './DialogueTab.type';
import './DialogueTab.css';

const DialogueTab = (props: DialogueTabProps) => {
  const {
    entries, total, issues, query, filter, cfg, glossary, variables, variableIndex,
    metrics, sheet, layout, draft, view, structureMode, readOnly,
    onQueryChange, onFilterChange, onOpen, onClose, onModeChange, onChangeStructureMode,
  } = props;

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
        {entries.map((entry) => {
          const locked = structuralEntry(entry.id);
          if (locked) return <LockedEntryCard key={entry.id} id={entry.id} reason={locked.reason} />;

          const open = view.isOpen(entry.id);
          const mode = view.modeOf(entry.id);
          const drafted = draft.tokensOf(entry.id);
          const entryLayout = drafted === null ? layout.layoutFor(entry) : layout.layoutOf(drafted);
          const editing = open && mode === 'edit' && drafted !== null && cfg !== null;

          return (
            <EntryListItem
              key={entry.id}
              entry={entry}
              layout={entryLayout}
              variables={variableIndex}
              issues={issues[entry.id]}
              open={open}
              mode={mode}
              editor={editing && cfg && drafted ? (
                <EntryEditor
                  tokens={drafted}
                  rows={entryLayout.rows}
                  cfg={cfg}
                  glossary={glossary}
                  variables={variables}
                  metrics={metrics}
                  sheet={sheet}
                  structureMode={structureMode}
                  dirty={draft.isDirty(entry.id)}
                  readOnly={readOnly}
                  onChangeTokens={(next) => draft.setTokens(entry.id, next)}
                  onChangeStructureMode={onChangeStructureMode}
                  onSave={() => draft.commit(entry.id)}
                  onCancel={() => draft.cancel(entry.id)}
                />
              ) : null}
              preview={open && mode === 'preview' ? (
                <PreviewView
                  blocks={entryLayout.blocks}
                  terms={glossary}
                  metrics={metrics}
                  sheet={sheet}
                />
              ) : null}
              onOpen={onOpen}
              onClose={onClose}
              onModeChange={onModeChange}
            />
          );
        })}
      </Box>

      {!cfg && (
        <Text className="dialogue-tab__hint" variant="caption">
          This set names a base language the app does not know, so editing is unavailable.
        </Text>
      )}
    </Box>
  );
};

export { DialogueTab };
