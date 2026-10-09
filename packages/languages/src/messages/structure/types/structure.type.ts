/* @layer shared-game @kind types */
import type { LayoutOptions } from '../../layout/layout-plan';
import type { GlyphMetrics } from '../../layout/types';
import type { DialogueLineView } from '../../lines/types';
import type { GlossaryTerm, SetStructure, Token } from '../../types';

type Caret = {
  line: number;
  token: number;
};

type StructureContext = {
  metrics: GlyphMetrics;
  glossary: GlossaryTerm[];
  opts?: LayoutOptions;
};

type CaretSite = {
  block: number;
  blockStart: number;
  linesInBlock: number;
  lineInBlock: number;
};

type LineBreak = {
  head: Token[];
  tail: Token[];
};

type StructureMode = SetStructure;

type StructurePolicy = {
  mode: StructureMode;
  canOpenLine: (linesInBlock: number) => boolean;
  cascadesAcrossBlocks: boolean;
  restartsAtBlock: boolean;
};

type WorkLine = {
  line: DialogueLineView;
  block: number;
  seeded: boolean;
};

export type { Caret, CaretSite, LineBreak, StructureContext, StructureMode, StructurePolicy, WorkLine };
