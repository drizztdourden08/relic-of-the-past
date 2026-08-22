/* @layer renderer-components @kind component */
/**
 * The dialogue tab: a searchable list of entry cards, one of which may be open
 * for editing.
 *
 * Cards are read-only until opened, so scanning the set can never change it.
 * Entries the engine uses as scaffolding are shown locked instead — they hold
 * no translatable words, and editing one breaks every choice prompt.
 */
import { useCallback } from 'react';
import { Box, Text, TextInput, EmptyState, SectionHeader, SegmentedControl } from '@ds/primitives';
import { EntryCard } from './EntryCard';
import { EntryEditor } from './EntryEditor';
import { LockedEntryCard } from './LockedEntryCard';
import { structuralEntry } from '@shared/game/language';
import type { DialogueEntry, GlossaryTerm } from '@shared/game/language';
import type { LanguageConfig } from '@shared/asset-extraction/text/data/language-data';
import type { GlyphMetrics, GlyphSheet } from '@shared/game/language/layout/types';
import type { EntryIssueMap } from '../language-editor.type';
import type { EntryDraftState } from '../behavior/useEntryDraft';
import type { LayoutLookup } from '../behavior/useEntryLayout';
import './DialogueTab.css';

type EntryFilter = 'all' | 'warnings' | 'choices';

type DialogueTabProps = {
  entries: DialogueEntry[];
  total: number;
  issues: EntryIssueMap;
  query: string;
  filter: EntryFilter;
  cfg: LanguageConfig | null;
  glossary: GlossaryTerm[];
  metrics: GlyphMetrics | null;
  sheet: GlyphSheet | null;
  layout: LayoutLookup;
  draft: EntryDraftState;
  visible: ReadonlySet<number>;
  observe: (id: number, element: HTMLElement | null) => void;
  onQueryChange: (query: string) => void;
  onFilterChange: (filter: EntryFilter) => void;
};

const FILTER_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'warnings', label: 'Needs attention' },
  { value: 'choices', label: 'Choices' },
];

const DialogueTab = (props: DialogueTabProps) => {
  const {
    entries, total, issues, query, filter, cfg, glossary, metrics, sheet,
    layout, draft, visible, observe, onQueryChange, onFilterChange,
  } = props;

  const handleQuery = useCallback((event: { currentTarget: { value: string } }) => {
    onQueryChange(event.currentTarget.value);
  }, [onQueryChange]);

  const handleFilter = useCallback((value: string) => {
    onFilterChange(value as EntryFilter);
  }, [onFilterChange]);

  const searching = query.trim().length > 0 || filter !== 'all';

  return (
    <Box className="dialogue-tab">
      <SectionHeader
        title={searching ? `${entries.length} of ${total} lines` : `${total} lines`}
        action={<TextInput value={query} onChange={handleQuery} placeholder="Search all text…" />}
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

          if (draft.openId === entry.id && cfg) {
            const drafted = layout.layoutOf(draft.tokens);
            return (
              <EntryEditor
                key={entry.id}
                id={entry.id}
                tokens={draft.tokens}
                rows={drafted.rows}
                cfg={cfg}
                glossary={glossary}
                metrics={metrics}
                sheet={sheet}
                dirty={draft.dirty}
                onChangeTokens={draft.setTokens}
                onSave={draft.commit}
                onCancel={draft.cancel}
              />
            );
          }

          const shown = visible.has(entry.id);
          return (
            <Box key={entry.id} ref={(el: HTMLElement | null) => observe(entry.id, el)}>
              <EntryCard
                id={entry.id}
                tokens={entry.tokens}
                screens={shown ? layout.layoutFor(entry).screens : []}
                metrics={metrics}
                sheet={sheet}
                issues={issues[entry.id]}
                editDisabled={draft.openId !== null && draft.dirty}
                onEdit={() => draft.open(entry)}
              />
            </Box>
          );
        })}
      </Box>

      {draft.openId !== null && draft.dirty && (
        <Text className="dialogue-tab__hint" variant="caption">
          {`Line #${String(draft.openId).padStart(3, '0')} has unsaved changes — save or cancel it before opening another.`}
        </Text>
      )}
      {!cfg && (
        <Text className="dialogue-tab__hint" variant="caption">
          This set names a base language the app does not know, so editing is unavailable.
        </Text>
      )}
    </Box>
  );
};

export { DialogueTab };
export type { DialogueTabProps, EntryFilter };
