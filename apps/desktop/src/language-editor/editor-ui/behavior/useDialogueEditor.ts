/* @layer renderer-components @kind hook */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useEditor } from '@tiptap/react';
import { redoDepth, undoDepth } from '@tiptap/pm/history';
import { joinLines } from '@rotp/languages';
import { updateEditorRuntime } from '../../editor/editor-runtime';
import { docToLines, linesOfTokens, linesToDoc } from '../editor-contract';
import { signatureOf } from '../tokens-signature';
import { useEditorCommands } from './useEditorCommands';
import { useTokenSync } from './useTokenSync';
import type { Editor } from '@tiptap/core';
import type { DialogueLineView } from '@rotp/languages';
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
    const { view } = editor;
    view.dispatch(view.state.tr);
  }, [editor, metrics, glossary]);

  useTokenSync({ editor, tokens, emittedRef, metrics, glossary, onLines: setLines });

  useEffect(() => {
    if (editor.isDestroyed) return;
    setLines(docToLines(editor.getJSON(), metrics, glossary));
  }, [editor, metrics, glossary]);

  const commands = useEditorCommands(editor);

  return {
    editor, focused, caretLine, lines, ...commands,
    canUndo: historyDepths.canUndo, canRedo: historyDepths.canRedo,
  };
};

export { useDialogueEditor };
