/* @layer renderer-components @kind types */
import type { Extensions } from '@tiptap/core';
import type { GlossaryTerm, GlyphMetrics, Token } from '@rotp/languages';

type UseDialogueEditorParams = {
  tokens: Token[];
  extensions: Extensions;
  metrics: GlyphMetrics;
  glossary: GlossaryTerm[];
  readOnly: boolean;
  onChange: (tokens: Token[]) => void;
};

export type { UseDialogueEditorParams };
