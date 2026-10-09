/* @layer renderer-components @kind types */
import type { DialogueEntry, GlossaryTerm, SetStructure, Variable, VariableIndex } from '@rotp/languages';
import type { LanguageConfig } from '@rotp/asset-extraction';
import type { GlyphMetrics, GlyphSheet } from '@rotp/languages';
import type { EntryIssueMap } from '../language-editor.type';
import type { EntryDraftState } from '../behavior/useEntryDraft.type';
import type { LayoutLookup } from '@domains/packs/language/behavior/useEntryLayout';
import type { EntryViewMode, EntryViewState } from '@domains/packs/language/behavior/useEntryView';

type EntryFilter = 'all' | 'warnings' | 'choices';

type DialogueTabProps = {
  entries: DialogueEntry[];
  total: number;
  issues: EntryIssueMap;
  query: string;
  filter: EntryFilter;
  cfg: LanguageConfig | null;
  glossary: GlossaryTerm[];
  variables: Variable[];
  variableIndex: VariableIndex;
  metrics: GlyphMetrics | null;
  sheet: GlyphSheet | null;
  layout: LayoutLookup;
  draft: EntryDraftState;
  view: EntryViewState;
  structureMode: SetStructure;
  readOnly: boolean;
  onQueryChange: (query: string) => void;
  onFilterChange: (filter: EntryFilter) => void;
  onOpen: (id: number) => void;
  onClose: (id: number) => void;
  onModeChange: (id: number, mode: EntryViewMode) => void;
  onChangeStructureMode: (mode: SetStructure) => void;
};

export type { DialogueTabProps, EntryFilter };
