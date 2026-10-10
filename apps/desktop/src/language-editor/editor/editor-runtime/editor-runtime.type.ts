/* @layer renderer-components @kind types */
import type { GlossaryTerm, GlyphMetrics, SetStructure } from '@rotp/languages';

type EditorRuntime = {
  metrics: GlyphMetrics | null;
  glossary: GlossaryTerm[];
  mode: SetStructure;
};

export type { EditorRuntime };
