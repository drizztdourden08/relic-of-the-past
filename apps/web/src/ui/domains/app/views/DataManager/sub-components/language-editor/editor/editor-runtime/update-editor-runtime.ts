/* @layer renderer-components @kind logic */
import { editorRuntime } from './editor-runtime';
import type { EditorRuntime } from './editor-runtime.type';

const updateEditorRuntime = (next: Partial<EditorRuntime>): void => {
  Object.assign(editorRuntime, next);
};

export { updateEditorRuntime };
