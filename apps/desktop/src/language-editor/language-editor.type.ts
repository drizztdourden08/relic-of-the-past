/* @layer renderer-components @kind types */
import type { EntryIssue, GlossaryTerm, LanguageSet, PauseLabelKey, SetStructure, TextGroupId, Token, Variable } from '@rotp/languages';

type EntryIssueMap = Record<number, EntryIssue[]>;

type NameEdit =
  | { group: 'items'; key: string; value: string }
  | { group: 'bottles'; key: number; value: string }
  | { group: 'labels'; key: PauseLabelKey; value: string };

type LanguageEditorActions = {
  setEntryTokens: (id: number, tokens: Token[]) => void;
  setEntryNote: (id: number, note: string) => void;
  setNameValue: (edit: NameEdit) => void;
  setStructureMode: (mode: SetStructure) => void;
  setTextValue: (group: TextGroupId, key: string, value: string) => void;
  upsertGlossaryTerm: (term: GlossaryTerm) => void;
  removeGlossaryTerm: (key: string) => void;
  setVariableValue: (variable: Variable, value: string) => void;
  setManyEntryTokens: (edits: { entryId: number; tokens: Token[] }[]) => void;
  saveNow: () => Promise<void>;
};

type LanguageEditorState = LanguageEditorActions & {
  set: LanguageSet | null;
  loading: boolean;
  error: string | null;
  dirty: boolean;
  saving: boolean;
  saveError: string | null;
  issues: EntryIssueMap;
  variables: Variable[];
  terms: GlossaryTerm[];
};

export type {
  EntryIssueMap,
  LanguageEditorState,
  NameEdit,
};
