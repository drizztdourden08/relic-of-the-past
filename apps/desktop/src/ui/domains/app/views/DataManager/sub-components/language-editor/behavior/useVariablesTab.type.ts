/* @layer renderer-components @kind types */
import type { VariableFilter } from '@rotp/design/packs';
import type { DialogueEntry, Token, Variable } from '@rotp/languages';
import type { HardcodedGroup } from './hardcoded-report';

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

export type { UseVariablesTabParams, VariablesTabState };
