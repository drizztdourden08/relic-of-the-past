/* @layer renderer-components @kind component */
/**
 * The translation editor: one language set, edited a line at a time.
 *
 * The view tier — it owns the loaded set, the search query, the open draft and
 * which cards are near enough to the viewport to paint themselves, and hands
 * plain props to the presentational cards and tables below.
 */
import { useCallback, useMemo, useState } from 'react';
import { Box, TabBar, EmptyState, Spinner } from '@ds/primitives';
import { kLanguages } from '@shared/asset-extraction/text/data/language-data';
import { useLanguageEditor } from './behavior/useLanguageEditor';
import { useTranslationSearch } from './behavior/useTranslationSearch';
import { useSetFont } from './behavior/useSetFont';
import { useEntryLayout } from './behavior/useEntryLayout';
import { useEntryDraft } from './behavior/useEntryDraft';
import { useVisibleEntries } from './behavior/useVisibleEntries';
import { BundleHeader } from './sub-components/BundleHeader';
import { DialogueTab } from './sub-components/DialogueTab';
import { NamesTable } from './sub-components/NamesTable';
import { GlossaryTable } from './sub-components/GlossaryTable';
import { countGlossaryRefs, filterEntriesByHits } from './behavior/editor-selectors';
import {
  countGlossaryCaseMisses, countGlossaryLinkTargets, planGlossaryLinks,
} from './behavior/link-glossary-refs';
import { selectEntries } from './behavior/select-entries';
import type { EntryFilter } from './sub-components/DialogueTab';
import type { GlossaryTerm, PauseLabelKey } from '@shared/game/language';
import type { TabItem } from '@ds/primitives';
import './LanguageEditor.css';

type LanguageEditorProps = {
  /** The set to edit; null renders the empty state. */
  id: string | null;
};

const NO_TERMS: GlossaryTerm[] = [];

const LanguageEditor = (props: LanguageEditorProps) => {
  const { id } = props;
  const editor = useLanguageEditor(id);
  const {
    set, loading, error, dirty, saving, saveError, issues,
    setEntryTokens, setNameValue, upsertGlossaryTerm, removeGlossaryTerm, saveNow,
  } = editor;

  const [tab, setTab] = useState('dialogue');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<EntryFilter>('all');

  const glossary = set?.glossary ?? NO_TERMS;
  const search = useTranslationSearch(set, query);
  const { metrics, sheet } = useSetFont(id, set?.base);
  const layout = useEntryLayout(metrics, glossary);
  const draft = useEntryDraft(setEntryTokens);
  const { visible, observe } = useVisibleEntries();

  const cfg = useMemo(() => (set ? kLanguages[set.base] ?? null : null), [set]);

  const entries = useMemo(() => selectEntries({
    entries: filterEntriesByHits(set?.dialogue ?? [], search.hits, search.applied),
    filter,
    issues,
  }), [set?.dialogue, search.hits, search.applied, filter, issues]);

  const warnings = useMemo(
    () => Object.values(issues).filter((list) => list.length > 0).length,
    [issues],
  );

  const refCounts = useMemo(() => countGlossaryRefs(set?.dialogue ?? []), [set?.dialogue]);

  const linkCounts = useMemo(() => {
    const dialogue = set?.dialogue ?? [];
    const targets: Record<string, number> = {};
    const misses: Record<string, number> = {};
    for (const term of glossary) {
      targets[term.key] = countGlossaryLinkTargets(dialogue, term.value);
      misses[term.key] = countGlossaryCaseMisses(dialogue, term.value);
    }
    return { targets, misses };
  }, [set?.dialogue, glossary]);

  const handleItemName = useCallback((key: string, value: string) => {
    setNameValue({ group: 'items', key, value });
  }, [setNameValue]);
  const handleBottleName = useCallback((key: number, value: string) => {
    setNameValue({ group: 'bottles', key, value });
  }, [setNameValue]);
  const handleLabelName = useCallback((key: PauseLabelKey, value: string) => {
    setNameValue({ group: 'labels', key, value });
  }, [setNameValue]);
  const handleTermChange = useCallback((key: string, value: string) => {
    upsertGlossaryTerm({ key, value });
  }, [upsertGlossaryTerm]);

  /** Retags every linkable occurrence of one term's value as a ref to it. */
  const handleTermLink = useCallback((key: string) => {
    const term = glossary.find((candidate) => candidate.key === key);
    if (!term) return;
    for (const plan of planGlossaryLinks(set?.dialogue ?? [], term.value, key)) {
      setEntryTokens(plan.entryId, plan.tokens);
    }
  }, [set?.dialogue, glossary, setEntryTokens]);

  const tabs = useMemo<TabItem[]>(() => [
    { id: 'dialogue', label: 'Dialogue', badge: set?.dialogue.length },
    { id: 'names', label: 'Menu names' },
    { id: 'glossary', label: 'Glossary', badge: glossary.length },
  ], [set?.dialogue.length, glossary.length]);

  if (!id) return <EmptyState message="Select a language set to edit" />;
  if (loading) return <Spinner />;
  if (error || !set) return <EmptyState message={error ?? 'That language set could not be read'} />;

  return (
    <Box className="language-editor">
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
          total={set.dialogue.length}
          issues={issues}
          query={query}
          filter={filter}
          cfg={cfg}
          glossary={glossary}
          metrics={metrics}
          sheet={sheet}
          layout={layout}
          draft={draft}
          visible={visible}
          observe={observe}
          onQueryChange={setQuery}
          onFilterChange={setFilter}
        />
      )}
      {tab === 'names' && (
        <Box className="language-editor__pane">
          <NamesTable
            names={set.names}
            onChangeItem={handleItemName}
            onChangeBottle={handleBottleName}
            onChangeLabel={handleLabelName}
          />
        </Box>
      )}
      {tab === 'glossary' && (
        <Box className="language-editor__pane">
          <GlossaryTable
            terms={glossary}
            refCounts={refCounts}
            linkTargets={linkCounts.targets}
            caseMisses={linkCounts.misses}
            onChange={handleTermChange}
            onAdd={upsertGlossaryTerm}
            onLink={handleTermLink}
            onRemove={removeGlossaryTerm}
          />
        </Box>
      )}
    </Box>
  );
};

export { LanguageEditor };
export type { LanguageEditorProps };
