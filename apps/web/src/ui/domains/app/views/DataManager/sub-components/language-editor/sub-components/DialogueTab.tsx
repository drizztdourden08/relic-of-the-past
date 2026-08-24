/* @layer renderer-components @kind component */
/**
 * The dialogue tab: a searchable list of entries, closed by default, any number
 * of which may be open.
 *
 * CLOSED IS THE RESTING STATE. A set is a few hundred entries and the list's job
 * is finding one, so each row is a dense line of facts — who says it, what opens
 * it, how much of it there is, whether it fits — and opening one is the
 * deliberate act. Reading a card can never change it either; only the editing
 * view can, and only one entry may hold unsaved work at a time.
 *
 * Entries the engine uses as scaffolding are shown locked instead — they hold no
 * translatable words, and editing one breaks every choice prompt.
 *
 * Every listed entry is MEASURED, not only the ones near the viewport. A closed
 * row states its block and line counts and whether it fits, so the measurement is
 * what the row is for; and a closed row paints no canvas, which is what made
 * measuring the whole set too expensive when a card drew its boxes. The layout
 * cache is keyed on each entry's token array, so this is one walk per entry for
 * the life of the set rather than one per render.
 */
import { useCallback } from 'react';
import { Box, Text, TextInput, EmptyState, SectionHeader, SegmentedControl } from '@ds/primitives';
import { structuralEntry } from '@shared/game/language';
import { EntryEditor } from './EntryEditor';
import { LockedEntryCard } from './LockedEntryCard';
import { EntryListItem } from './entry';
import { PreviewView } from './preview';
import type { ChangeEvent } from 'react';
import type {
  DialogueEntry, GlossaryTerm, SetStructure, Variable, VariableIndex,
} from '@shared/game/language';
import type { LanguageConfig } from '@shared/asset-extraction/text/data/language-data';
import type { GlyphMetrics, GlyphSheet } from '@shared/game/language/layout/types';
import type { EntryIssueMap } from '../language-editor.type';
import type { EntryDraftState } from '../behavior/useEntryDraft';
import type { LayoutLookup } from '../behavior/useEntryLayout';
import type { EntryViewMode, EntryViewState } from '../behavior/useEntryView';
import './DialogueTab.css';

type EntryFilter = 'all' | 'warnings' | 'choices';

type DialogueTabProps = {
  entries: DialogueEntry[];
  total: number;
  issues: EntryIssueMap;
  query: string;
  filter: EntryFilter;
  cfg: LanguageConfig | null;
  /** Every variable carrying literal text, for measurement and expansion. */
  glossary: GlossaryTerm[];
  variables: Variable[];
  variableIndex: VariableIndex;
  metrics: GlyphMetrics | null;
  sheet: GlyphSheet | null;
  layout: LayoutLookup;
  draft: EntryDraftState;
  view: EntryViewState;
  structureMode: SetStructure;
  onQueryChange: (query: string) => void;
  onFilterChange: (filter: EntryFilter) => void;
  onOpen: (id: number) => void;
  onClose: (id: number) => void;
  onModeChange: (id: number, mode: EntryViewMode) => void;
  onChangeStructureMode: (mode: SetStructure) => void;
};

const FILTER_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'warnings', label: 'Needs attention' },
  { value: 'choices', label: 'Choices' },
];

const DialogueTab = (props: DialogueTabProps) => {
  const {
    entries, total, issues, query, filter, cfg, glossary, variables, variableIndex,
    metrics, sheet, layout, draft, view, structureMode,
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
    <TextInput value={query} onChange={handleQuery} placeholder="Search all text…" />
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
          // An entry with unsaved words is shown WITH them, in every view.
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
export type { DialogueTabProps, EntryFilter };
