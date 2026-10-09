/* @layer renderer-components @kind types */
import type { MutableRefObject } from 'react';
import type { Editor } from '@tiptap/core';
import type { DialogueLineView, GlossaryTerm, GlyphMetrics, Token } from '@shared/game/language';

type UseTokenSyncParams = {
  editor: Editor | null;
  tokens: Token[];
  emittedRef: MutableRefObject<string>;
  metrics: GlyphMetrics;
  glossary: GlossaryTerm[];
  onLines: (lines: DialogueLineView[]) => void;
};

export type { UseTokenSyncParams };
