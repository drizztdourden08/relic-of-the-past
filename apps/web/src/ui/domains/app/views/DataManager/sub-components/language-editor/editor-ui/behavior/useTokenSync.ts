/* @layer renderer-components @kind hook */
/**
 * Keeps the editor's document in step with an incoming `tokens` prop WITHOUT
 * touching the caret while someone is typing.
 *
 * This is the whole reason the first editor was unusable. The editor is a
 * controlled-ish component: every keystroke emits a new token array upward, the
 * parent stores it, and it comes straight back down as a prop. Replacing the
 * document on every arriving prop therefore replaces it on every keystroke, and
 * `setContent` rebuilds the whole document. That throws the selection away and
 * drops the caret at the start. The symptom is a caret that jumps home after
 * each letter.
 *
 * The fix is to recognise our OWN echo and do nothing. Every array this editor
 * emits is recorded as a signature; an arriving prop whose signature matches the
 * last emission is that same edit coming back around, and is ignored. Only a
 * change from somewhere else fails to match, and only then is the document
 * rebuilt. That means a different entry selected, a revert, or an out-of-band
 * edit.
 *
 * `emitUpdate: false` on the rebuild closes the other half of the loop: a
 * genuine external replacement must not immediately report itself back upward as
 * a fresh edit. Which also means the lines it produced have to be handed over
 * directly, since no update will arrive to recompute them. Those lines come from
 * the model's own splitter, so a replacement is guttered by exactly the same
 * rules as an edit.
 */
import { useEffect, useRef } from 'react';
import { linesOfTokens, linesToDoc } from '../editor-contract';
import { signatureOf } from '../tokens-signature';
import type { MutableRefObject } from 'react';
import type { Editor } from '@tiptap/core';
import type { DialogueLineView, GlossaryTerm, GlyphMetrics, Token } from '@shared/game/language';

type UseTokenSyncParams = {
  editor: Editor | null;
  tokens: Token[];
  /** What this editor last sent upward. Shared with the update half. */
  emittedRef: MutableRefObject<string>;
  metrics: GlyphMetrics;
  glossary: GlossaryTerm[];
  onLines: (lines: DialogueLineView[]) => void;
};

const useTokenSync = (params: UseTokenSyncParams): void => {
  const { editor, tokens, emittedRef, metrics, glossary, onLines } = params;
  const signature = signatureOf(tokens);

  // Read at replacement time, not depended on: a new font or glossary
  // must not rebuild the document under a typist. The measured half re-measures
  // on its own when either changes.
  const latest = useRef({ tokens, metrics, glossary, onLines });
  latest.current = { tokens, metrics, glossary, onLines };

  useEffect(() => {
    if (!editor || editor.isDestroyed) return;
    // Our own edit coming back down. The document already says this, so leave
    // the caret exactly where the typist left it.
    if (signature === emittedRef.current) return;
    emittedRef.current = signature;

    const current = latest.current;
    const lines = linesOfTokens(current.tokens, current.metrics, current.glossary);
    editor.commands.setContent(linesToDoc(lines), { emitUpdate: false });
    current.onLines(lines);
    // `tokens` is intentionally absent: `signature` IS its identity, and
    // depending on the array itself would re-fire on every re-render.
  }, [editor, signature]);
};

export { useTokenSync };
export type { UseTokenSyncParams };
