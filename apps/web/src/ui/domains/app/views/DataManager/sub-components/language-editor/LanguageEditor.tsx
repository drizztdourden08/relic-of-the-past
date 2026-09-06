/* @layer renderer-components @kind component */
/**
 * The translation editor: one language set, edited a line at a time. The
 * glossary and the menu-name table are one Variables tab on purpose: as two
 * lists a translator had to work out which one a piece of text lived in.
 */
import { useCallback, useMemo, useState } from 'react';
import { Box, TabBar, EmptyState, Spinner } from '@ds/primitives';
import { buildVariableIndex } from '@shared/game/language';
import { kLanguages } from '@shared/asset-extraction/text/data/language-data';
import { useLanguageEditor } from './behavior/useLanguageEditor';
import { useTranslationSearch } from './behavior/useTranslationSearch';
import { useSetFont } from './behavior/useSetFont';
import { useEntryLayout } from './behavior/useEntryLayout';
import { useEntryOpen } from './behavior/useEntryOpen';
import { useVariablesTab } from './behavior/useVariablesTab';
import { BundleHeader } from './sub-components/BundleHeader';
import { DialogueTab } from './sub-components/DialogueTab';
import { TextGroupsTab } from './sub-components/text-groups';
import { StaleGameNotice } from './sub-components/StaleGameNotice';
import { UnbuiltPane } from './sub-components/UnbuiltPane';
import { useTextGroups } from './behavior/useTextGroups';
import { FindHardcodedDialog, VariablesTable } from './sub-components/variables';
import { filterEntriesByHits } from './behavior/editor-selectors';
import { selectEntries } from './behavior/select-entries';
import type { EntryFilter } from './sub-components/DialogueTab';
import type { DialogueEntry } from '@shared/game/language';
import type { TabItem } from '@ds/primitives';
import './LanguageEditor.css';

type LanguageEditorProps = {
  /** The set to edit; null renders the empty state. */
  id: string | null;
};

const NO_ENTRIES: DialogueEntry[] = [];

/** Marks the two tabs whose surfaces are built but not yet connected to the game. */
const LOCKED = '🔒';

const VARIABLES_SUMMARY = 'Substitutions are listed and editable here, but nothing reads them yet.';
const TEXT_SUMMARY = 'Every string the game shows is listed here, but none of it is baked yet.';

const LanguageEditor = (props: LanguageEditorProps) => {
  const { id } = props;
  const editor = useLanguageEditor(id);
  const {
    set, loading, error, dirty, saving, saveError, issues, variables, terms,
    setEntryTokens, setManyEntryTokens, setStructureMode, setTextValue, setVariableValue,
    upsertGlossaryTerm, removeGlossaryTerm, saveNow,
  } = editor;

  const [tab, setTab] = useState('dialogue');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<EntryFilter>('all');

  const dialogue = set?.dialogue ?? NO_ENTRIES;
  const search = useTranslationSearch(set, query);
  const { metrics, sheet } = useSetFont(id, set?.base);
  const layout = useEntryLayout(metrics, terms);
  const { view, draft, open, close, setMode } = useEntryOpen(dialogue, setEntryTokens);
  const variablesTab = useVariablesTab({ dialogue, variables, onRewrite: setManyEntryTokens });

  const cfg = useMemo(() => (set ? kLanguages[set.base] ?? null : null), [set]);
  const variableIndex = useMemo(() => buildVariableIndex(variables), [variables]);

  const entries = useMemo(() => selectEntries({
    entries: filterEntriesByHits(dialogue, search.hits, search.applied),
    filter,
    issues,
  }), [dialogue, search.hits, search.applied, filter, issues]);

  const warnings = useMemo(
    () => Object.values(issues).filter((list) => list.length > 0).length,
    [issues],
  );

  const text = useTextGroups(set, setTextValue);

  const handleFilterChange = useCallback((next: EntryFilter) => setFilter(next), []);

  const textSlotCount = useMemo(
    () => text.groups.reduce((sum, group) => sum + group.slots.length, 0),
    [text.groups],
  );

  const tabs = useMemo<TabItem[]>(() => [
    { id: 'dialogue', label: 'Dialogue', badge: dialogue.length },
    { id: 'variables', label: 'Variables', icon: LOCKED, badge: variables.length },
    { id: 'text', label: 'Text', icon: LOCKED, badge: textSlotCount },
  ], [dialogue.length, variables.length, textSlotCount]);

  if (!id) return <EmptyState message="Select a language set to edit" />;
  if (loading) return <Spinner />;
  if (error || !set) return <EmptyState message={error ?? 'That language set could not be read'} />;

  return (
    <Box className="language-editor">
      <StaleGameNotice />
      <BundleHeader
        set={set}
        warnings={warnings}
        dirty={dirty}
        saving={saving}
        saveError={saveError}
        onSaveNow={saveNow}
      />

      <TabBar tabs={tabs} activeTab={tab} onTabChange={setTab} />

      {tab === 'dialogue' && (
        <DialogueTab
          entries={entries}
          total={dialogue.length}
          issues={issues}
          query={query}
          filter={filter}
          cfg={cfg}
          glossary={terms}
          variables={variables}
          variableIndex={variableIndex}
          metrics={metrics}
          sheet={sheet}
          layout={layout}
          draft={draft}
          view={view}
          structureMode={set?.structure ?? 'continuous'}
          onChangeStructureMode={setStructureMode}
          onQueryChange={setQuery}
          onFilterChange={handleFilterChange}
          onOpen={open}
          onClose={close}
          onModeChange={setMode}
        />
      )}
      {tab === 'variables' && (
        <Box className="language-editor__pane">
          <UnbuiltPane summary={VARIABLES_SUMMARY}>
            <VariablesTable
            variables={variables}
            rows={variablesTab.rows}
            used={variablesTab.used}
            filter={variablesTab.filter}
            query={variablesTab.query}
            onFilterChange={variablesTab.setFilter}
            onQueryChange={variablesTab.setQuery}
            onChangeValue={setVariableValue}
            onAddTerm={upsertGlossaryTerm}
            onRemoveTerm={removeGlossaryTerm}
              onFindHardcoded={variablesTab.openScan}
            />
          </UnbuiltPane>
        </Box>
      )}

      {tab === 'text' && (
        <Box className="language-editor__pane">
          <UnbuiltPane summary={TEXT_SUMMARY}>
            <TextGroupsTab
              groups={text.groups}
              activeGroup={text.activeGroup}
              values={text.values}
              onSelectGroup={text.selectGroup}
              onChangeValue={text.setValue}
            />
          </UnbuiltPane>
        </Box>
      )}

      <FindHardcodedDialog
        open={variablesTab.scanOpen}
        groups={variablesTab.groups}
        onApply={variablesTab.applyScan}
        onClose={variablesTab.closeScan}
      />
    </Box>
  );
};

export { LanguageEditor };
export type { LanguageEditorProps };
