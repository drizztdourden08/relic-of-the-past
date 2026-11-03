/* @layer shared-game @kind types */
import type { LayoutOptions } from '../../layout/layout-plan';
import type { GlyphMetrics } from '../../layout/types';
import type { GlossaryTerm, SetStructure, Token } from '../../types';

type StructureContext = {
  metrics: GlyphMetrics;
  glossary: GlossaryTerm[];
  opts?: LayoutOptions;
};

type LineBreak = {
  head: Token[];
  tail: Token[];
};

type StructureMode = SetStructure;

export type { LineBreak, StructureContext, StructureMode };
