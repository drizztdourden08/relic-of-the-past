/* @layer renderer-components @kind hook */
/**
 * The variables tab's own state: how the list is narrowed, how often each
 * variable is used, and the hardcoded-name scan.
 *
 * The SCAN IS LAZY. `findHardcoded` walks every text run of every entry against
 * every candidate phrase, which is far too much work to repeat on each render of
 * a tab nobody has asked to scan — so it runs when the dialog opens and not
 * before.
 *
 * Applying a report is ONE edit, not one per entry: the rewrites are collected
 * and written together, so the debounced save sees a single new set rather than a
 * few dozen half-applied ones.
 */
import { useCallback, useMemo, useState } from 'react';
import { findHardcoded } from '@shared/game/language';
import { countVariableUses } from './editor-selectors';
import { acceptedOf, groupHardcoded } from './hardcoded-report';
import { applyHardcoded } from './apply-hardcoded';
import { filterVariables } from '../sub-components/variables/variable-groups';
import type { DialogueEntry, Token, Variable } from '@shared/game/language';
import type { HardcodedGroup } from './hardcoded-report';
import type { VariableFilter } from '../sub-components/variables/variable-groups';

type UseVariablesTabParams = {
  dialogue: DialogueEntry[];
  variables: Variable[];
  onRewrite: (edits: { entryId: number; tokens: Token[] }[]) => void;
};

type VariablesTabState = {
  filter: VariableFilter;
  query: string;
  rows: Variable[];
  used: Record<string, number>;
  scanOpen: boolean;
  groups: HardcodedGroup[];
  setFilter: (filter: VariableFilter) => void;
  setQuery: (query: string) => void;
  openScan: () => void;
  closeScan: () => void;
  applyScan: (variableKeys: string[]) => void;
};

const NO_GROUPS: HardcodedGroup[] = [];

const useVariablesTab = (params: UseVariablesTabParams): VariablesTabState => {
  const { dialogue, variables, onRewrite } = params;

  const [filter, setFilter] = useState<VariableFilter>('all');
  const [query, setQuery] = useState('');
  const [scanOpen, setScanOpen] = useState(false);

  const rows = useMemo(() => filterVariables(variables, filter, query), [variables, filter, query]);
  const used = useMemo(() => countVariableUses(dialogue), [dialogue]);

  const groups = useMemo(
    () => (scanOpen ? groupHardcoded(findHardcoded(dialogue, variables), variables) : NO_GROUPS),
    [scanOpen, dialogue, variables],
  );

  const openScan = useCallback(() => setScanOpen(true), []);
  const closeScan = useCallback(() => setScanOpen(false), []);

  const applyScan = useCallback((variableKeys: string[]) => {
    const accepted = acceptedOf(groups, new Set(variableKeys));
    const rewrites = applyHardcoded(dialogue, accepted);
    if (rewrites.length > 0) onRewrite(rewrites);
    setScanOpen(false);
  }, [groups, dialogue, onRewrite]);

  return useMemo(() => ({
    filter, query, rows, used, scanOpen, groups,
    setFilter, setQuery, openScan, closeScan, applyScan,
  }), [filter, query, rows, used, scanOpen, groups, openScan, closeScan, applyScan]);
};

export { useVariablesTab };
export type { VariablesTabState };
