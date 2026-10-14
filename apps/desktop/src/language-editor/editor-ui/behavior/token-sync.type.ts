/* @layer renderer-components @kind types */
import type { RefObject } from 'react';
import type { Editor } from '@tiptap/core';
import type { DialogueLineView, GlossaryTerm, GlyphMetrics, Token } from '@rotp/languages';

type UseTokenSyncParams = {
  editor: Editor;
  tokens: Token[];
  emittedRef: RefObject<string>;
  metrics: GlyphMetrics;
  glossary: GlossaryTerm[];
  onLines: (lines: DialogueLineView[]) => void;
};

export type { UseTokenSyncParams };
