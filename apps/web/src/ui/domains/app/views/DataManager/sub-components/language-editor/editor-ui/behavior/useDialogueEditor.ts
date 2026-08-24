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
 *
 * The CARET LINE is reported for the block actions, which need to know which box
 * the author is in. It is deliberately not cleared on blur: pressing one of those
 * buttons takes focus out of the text, and an action that disabled itself the
 * instant it was pressed would never run. The editor keeps its own selection
 * through a blur, so the line the buttons act on is still the line the caret is
 * on.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useEditor } from '@tiptap/react';
import { redo, redoDepth, undo, undoDepth } from '@tiptap/pm/history';
import { joinLines } from '@shared/game/language';
import { updateEditorRuntime } from '../../editor/editor-runtime';
import { toggleWaitHere } from '../../editor/toggle-wait';
import { docToLines, linesOfTokens, linesToDoc, tokenToNode } from '../editor-contract';
import { signatureOf } from '../tokens-signature';
import { useTokenSync } from './useTokenSync';
import type { Editor } from '@tiptap/core';
import type { Extensions, JSONContent } from '@tiptap/core';
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
  const [caretLine, setCaretLine] = useState<number | null>(null);
  const [historyDepths, setHistoryDepths] = useState({ canUndo: false, canRedo: false });

  /*
   * The document-level index of the paragraph holding the caret, which IS the
   * line index the gutter counts and the block walk addresses. A selection
   * resting on the document itself has no paragraph, and is reported as none.
   */
  const readCaret = useCallback((instance: Editor) => {
    const { $from } = instance.state.selection;
    setCaretLine($from.depth === 0 ? null : $from.index(0));
  }, []);

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
      setHistoryDepths({
        canUndo: undoDepth(instance.state) > 0,
        canRedo: redoDepth(instance.state) > 0,
      });
      const emitted = joinLines(next);
      emittedRef.current = signatureOf(emitted);
      onChangeRef.current(emitted);
    },
    onSelectionUpdate: ({ editor: instance }) => readCaret(instance),
    onFocus: ({ editor: instance }) => { setFocused(true); readCaret(instance); },
    onBlur: () => setFocused(false),
  }, [extensions, readOnly]);

  // The structure plugins read the live context rather than a captured one, so a
  // font that arrives late still measures the very next keystroke.
  useEffect(() => {
    updateEditorRuntime({ metrics, glossary });
    // An empty transaction runs the view-update hooks, so every line's gutter
    // repaints with the widths the runtime just received.
    const view = editor?.view;
    if (view !== undefined) view.dispatch(view.state.tr);
  }, [editor, metrics, glossary]);

  useTokenSync({ editor, tokens, emittedRef, metrics, glossary, onLines: setLines });

  // The set's font arrives asynchronously, so the first lines are usually
  // measured without one. Re-measuring the document in place gives the gutter its
  // widths without disturbing the text or the caret.
  useEffect(() => {
    if (!editor || editor.isDestroyed) return;
    setLines(docToLines(editor.getJSON(), metrics, glossary));
  }, [editor, metrics, glossary]);

  /*
   * `tokenToNode` yields the single inline atom — handing `insertContent` a whole
   * `doc` would replace the entry instead of adding to it at the caret.
   *
   * A LIST rather than one token, because a picture the alphabet spells as two
   * entries is one thing to insert: both atoms go in on one press, in one
   * transaction, so a single undo takes the whole picture back out again.
   */
  const insertTokens = useCallback((tokens: Token[]) => {
    if (!editor || editor.isDestroyed) return;
    const nodes = tokens
      .map(tokenToNode)
      .filter((node): node is JSONContent => node !== null);
    if (nodes.length === 0) return;
    editor.chain().focus().insertContent(nodes).run();
  }, [editor]);

  const doUndo = useCallback(() => {
    if (!editor || editor.isDestroyed) return;
    undo(editor.state, editor.view.dispatch);
    editor.view.focus();
  }, [editor]);

  const doRedo = useCallback(() => {
    if (!editor || editor.isDestroyed) return;
    redo(editor.state, editor.view.dispatch);
    editor.view.focus();
  }, [editor]);

  /** Toggle the wait on the caret's line — the toolbar's "end box here". */
  const endBoxHere = useCallback(() => {
    if (!editor || editor.isDestroyed) return;
    toggleWaitHere(editor.state, editor.view.dispatch);
    editor.view.focus();
  }, [editor]);

  return {
    editor, focused, caretLine, insertTokens, lines,
    doUndo, doRedo, endBoxHere,
    canUndo: historyDepths.canUndo, canRedo: historyDepths.canRedo,
  };
};

export { useDialogueEditor };
export type { UseDialogueEditorParams };
