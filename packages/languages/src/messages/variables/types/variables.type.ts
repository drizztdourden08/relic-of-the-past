/* @layer shared-game @kind types */
import type { GlossaryTerm, NameTable } from '../../types';

type VariableKind = 'engine' | 'term' | 'menu-name';

type Variable = {
  key: string;
  kind: VariableKind;
  label: string;
  value: string | null;
  locked: boolean;
  maxGlyphs: number;
  note?: string;
};

type VariableIndex = Map<string, Variable>;

type Occurrence = {
  entryId: number;
  tokenIndex: number;
  at: number;
  text: string;
  variableKey: string;
  exists: boolean;
  match: 'exact' | 'case';
};

type Span = { from: number; to: number };

type Candidate = {
  variableKey: string;
  phrase: string;
  exists: boolean;
};

type NameTableData = {
  glossary: GlossaryTerm[];
  names: NameTable;
};

type ResolveMode = 'bake' | 'preview';

type ResolveOptions = {
  mode: ResolveMode;
  samples?: Record<string, string>;
};

type RunScan = {
  exact: number[];
  caseMiss: number[];
};

export type {
  Candidate, NameTableData, Occurrence, ResolveMode, ResolveOptions, RunScan, Span, Variable, VariableIndex,
  VariableKind,
};
