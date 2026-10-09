/* @layer renderer-components @kind types */
import type { GlossaryTerm, GlyphMetrics, SetStructure } from '@shared/game/language';

type EditorRuntime = {
  metrics: GlyphMetrics | null;
  glossary: GlossaryTerm[];
  mode: SetStructure;
};

export type { EditorRuntime };
