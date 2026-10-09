/* @layer renderer-components @kind types */
import type { BlockDoc, DialogueEntry, DialogueLineView, GlossaryTerm, Token, Variable, VariableIndex } from '@rotp/languages';
import type { GlyphMetrics, GlyphSheet, RowFit, ScreenFit } from '@rotp/languages';

type SetFontAssets = {
  sheet: GlyphSheet;
  metrics: GlyphMetrics;
};

type EntryLayout = {
  rows: RowFit[];
  screens: ScreenFit[];
  lines: DialogueLineView[];
  blocks: BlockDoc;
};

type LayoutLookup = {
  layoutFor: (entry: DialogueEntry) => EntryLayout;
  layoutOf: (tokens: Token[]) => EntryLayout;
};

type EntryViewMode = 'read' | 'edit' | 'preview';

type EntryViewState = {
  isOpen: (id: number) => boolean;
  modeOf: (id: number) => EntryViewMode;
  open: (id: number) => void;
  close: (id: number) => void;
  setMode: (id: number, mode: EntryViewMode) => void;
};

type SetVariables = {
  variables: Variable[];
  terms: GlossaryTerm[];
  index: VariableIndex;
};

export type { EntryLayout, EntryViewMode, EntryViewState, LayoutLookup, SetFontAssets, SetVariables };
