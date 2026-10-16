/* @layer renderer-components @kind hook */
import { useMemo, useState } from 'react';
import { buildVariableIndex } from '@rotp/languages';
import { kLanguages } from '@rotp/asset-extraction';
import { useTranslationSearch, useEntryLayout, filterEntriesByHits } from '@rotp/design/packs';
import type { EntryFilter } from '../sub-components/DialogueTab.type';
import { NO_ENTRIES } from '../LanguageEditor.constants';
import type { DialogueViewParams } from './dialogue-view.type';
import { selectEntries } from './select-entries';
import { selectionOf } from './selection-of';
import { useEntryOpen } from './useEntryOpen';
import { useSetFont } from './useSetFont';

const useDialogueView = (params: DialogueViewParams) => {
  const { id, set, issues, variables, terms, setEntryTokens } = params;
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<EntryFilter>('all');

  const dialogue = set?.dialogue ?? NO_ENTRIES;
  const search = useTranslationSearch(set, query);
  const { metrics, sheet } = useSetFont(id, set?.base);
  const layout = useEntryLayout(metrics, terms);
  const { view, draft, selected, open, close, setMode } = useEntryOpen(dialogue, setEntryTokens);

  const cfg = useMemo(() => (set ? kLanguages[set.base] ?? null : null), [set]);
  const variableIndex = useMemo(() => buildVariableIndex(variables), [variables]);

  const entries = useMemo(() => selectEntries({
    entries: filterEntriesByHits(dialogue, search.hits, search.applied),
    filter,
    issues,
  }), [dialogue, search.hits, search.applied, filter, issues]);

  const selection = useMemo(
    () => selectionOf({ dialogue, selected, layout, draft, variables: variableIndex, issues }),
    [dialogue, selected, layout, draft, variableIndex, issues],
  );

  return {
    dialogue,
    selection,
    find: { query, filter, setQuery, setFilter },
    tabProps: {
      entries, total: dialogue.length, issues, query, filter, cfg, glossary: terms, variables, variableIndex,
      metrics, sheet, layout, draft, view, structureMode: set?.structure ?? 'continuous',
      onOpen: open, onClose: close, onModeChange: setMode,
    },
  };
};

export { useDialogueView };
