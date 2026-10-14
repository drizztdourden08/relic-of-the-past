/* @layer renderer-components @kind hook */
import { useCallback } from 'react';
import { redo, undo } from '@tiptap/pm/history';
import type { Editor, JSONContent } from '@tiptap/core';
import type { Token } from '@rotp/languages';
import { toggleWaitHere } from '../../editor/toggle-wait';
import { tokenToNode } from '../editor-contract';

const useEditorCommands = (editor: Editor) => {
  const insertTokens = useCallback((tokens: Token[]) => {
    if (editor.isDestroyed) return;
    const nodes = tokens
      .map(tokenToNode)
      .filter((node): node is JSONContent => node !== null);
    if (nodes.length === 0) return;
    editor.chain().focus().insertContent(nodes).run();
  }, [editor]);

  const doUndo = useCallback(() => {
    if (editor.isDestroyed) return;
    undo(editor.state, editor.view.dispatch);
    editor.view.focus();
  }, [editor]);

  const doRedo = useCallback(() => {
    if (editor.isDestroyed) return;
    redo(editor.state, editor.view.dispatch);
    editor.view.focus();
  }, [editor]);

  const endBoxHere = useCallback(() => {
    if (editor.isDestroyed) return;
    toggleWaitHere(editor.state, editor.view.dispatch);
    editor.view.focus();
  }, [editor]);

  return { insertTokens, doUndo, doRedo, endBoxHere };
};

export { useEditorCommands };
