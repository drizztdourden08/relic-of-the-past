/* @layer renderer-components @kind hook */
/**
 * Owns the editor instance for one dialogue entry: creates it, keeps the LINE
 * VIEWS the gutter reads, reports every edit upward as tokens, tracks whether it
 * currently has focus (which is what the legend keys off), and inserts a token AT
 * THE CARET.
 *
 * Lines are the pivot, in both directions. An edit produces line views from the
 * document, the gutter draws them, and the token stream is the model's own
 * inverse of those same views — so what an author sees measured and what gets
 * stored can never be two different readings of the entry. Nothing here writes a
 * control code.
 *
 * The instance is created once per extension list, so the `onUpdate` closure
 * outlives whatever `onChange`, font or glossary was current at creation time —
 * hence the refs. Without them, an insert made ten renders later would be
 * reported to a stale parent callback, or measured against a font that has since
 * been replaced.
 *
 * Caret safety on the way DOWN is `useTokenSync`'s job; the shared `emittedRef`
 * is the record of what this editor last sent up, and the two halves read it
 * together.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useEditor } from '@tiptap/react';
import { joinLines } from '@shared/game/language';
import { docToLines, linesOfTokens, linesToDoc, tokenToNode } from '../editor-contract';
import { signatureOf } from '../tokens-signature';
import { useTokenSync } from './useTokenSync';
import type { Extensions } from '@tiptap/core';
import type { DialogueLineView, GlossaryTerm, GlyphMetrics, Token } from '@shared/game/language';

type UseDialogueEditorParams = {
  tokens: Token[];
  extensions: Extensions;
  metrics: GlyphMetrics;
  glossary: GlossaryTerm[];
  readOnly: boolean;
  onChange: (tokens: Token[]) => void;
};

const useDialogueEditor = (params: UseDialogueEditorParams) => {
  const { tokens, extensions, metrics, glossary, readOnly, onChange } = params;

  const emittedRef = useRef<string>(signatureOf(tokens));
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const measureRef = useRef({ metrics, glossary });
  measureRef.current = { metrics, glossary };

  const [focused, setFocused] = useState(false);

  // Mount-time content only. Every later change arrives through useTokenSync,
  // which is the half that knows when a rebuild is safe.
  const initialTokensRef = useRef(tokens);
  const initialLines = useMemo(() => linesOfTokens(initialTokensRef.current, metrics, glossary), []);
  const initialContent = useMemo(() => linesToDoc(initialLines), []);
  const [lines, setLines] = useState<DialogueLineView[]>(initialLines);

  const editor = useEditor({
    extensions,
    content: initialContent,
    editable: !readOnly,
    onUpdate: ({ editor: instance }) => {
      const { metrics: font, glossary: terms } = measureRef.current;
      const next = docToLines(instance.getJSON(), font, terms);
      setLines(next);
      const emitted = joinLines(next);
      emittedRef.current = signatureOf(emitted);
      onChangeRef.current(emitted);
    },
    onFocus: () => setFocused(true),
    onBlur: () => setFocused(false),
  }, [extensions, readOnly]);

  useTokenSync({ editor, tokens, emittedRef, metrics, glossary, onLines: setLines });

  // The set's font arrives asynchronously, so the first lines are usually
  // measured without one. Re-measuring the document in place gives the gutter its
  // widths without disturbing the text or the caret.
  useEffect(() => {
    if (!editor || editor.isDestroyed) return;
    setLines(docToLines(editor.getJSON(), metrics, glossary));
  }, [editor, metrics, glossary]);

  // `tokenToNode` yields the single inline atom — handing `insertContent` a whole
  // `doc` would replace the entry instead of adding to it at the caret.
  const insertToken = useCallback((token: Token) => {
    if (!editor || editor.isDestroyed) return;
    const node = tokenToNode(token);
    if (node === null) return;
    editor.chain().focus().insertContent(node).run();
  }, [editor]);

  return { editor, focused, insertToken, lines };
};

export { useDialogueEditor };
export type { UseDialogueEditorParams };
