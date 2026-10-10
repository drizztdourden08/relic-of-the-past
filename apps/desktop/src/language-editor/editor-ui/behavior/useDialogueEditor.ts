/* @layer renderer-components @kind hook */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useEditor } from '@tiptap/react';
import { redo, redoDepth, undo, undoDepth } from '@tiptap/pm/history';
import { joinLines } from '@rotp/languages';
import { updateEditorRuntime } from '../../editor/editor-runtime';
import { toggleWaitHere } from '../../editor/toggle-wait';
import { docToLines, linesOfTokens, linesToDoc, tokenToNode } from '../editor-contract';
import { signatureOf } from '../tokens-signature';
import { useTokenSync } from './useTokenSync';
import type { Editor, JSONContent } from '@tiptap/core';
import type { DialogueLineView, Token } from '@rotp/languages';
import type { UseDialogueEditorParams } from './dialogue-editor.type';

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

  const readCaret = useCallback((instance: Editor) => {
    const { $from } = instance.state.selection;
    setCaretLine($from.depth === 0 ? null : $from.index(0));
  }, []);

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

  useEffect(() => {
    updateEditorRuntime({ metrics, glossary });
    const view = editor?.view;
    if (view !== undefined) view.dispatch(view.state.tr);
  }, [editor, metrics, glossary]);

  useTokenSync({ editor, tokens, emittedRef, metrics, glossary, onLines: setLines });

  useEffect(() => {
    if (!editor || editor.isDestroyed) return;
    setLines(docToLines(editor.getJSON(), metrics, glossary));
  }, [editor, metrics, glossary]);

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
