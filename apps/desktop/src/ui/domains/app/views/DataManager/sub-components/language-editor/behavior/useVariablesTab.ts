/* @layer renderer-components @kind hook */
import { useCallback, useMemo, useState } from 'react';
import { findHardcoded } from '@rotp/languages';
import { countVariableUses } from '@domains/packs/language/behavior/entry-selectors';
import { filterVariables } from '@domains/packs/language/compounds/variables/variable-groups';
import type { VariableFilter } from '@domains/packs/language/compounds/variables/variable-groups';
import { acceptedOf, groupHardcoded } from './hardcoded-report';
import { applyHardcoded } from './apply-hardcoded';
import { NO_GROUPS } from './useVariablesTab.constants';
import type { UseVariablesTabParams, VariablesTabState } from './useVariablesTab.type';

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
