/* @layer renderer-components @kind logic */
/**
 * The live context the structure plugins read at dispatch time.
 *
 * A ProseMirror plugin is built once, when the editor is created, but the
 * language's font arrives later and the automation mode can change while the
 * editor is open. Threading either through the extension list would rebuild the
 * editor — and rebuilding is exactly what loses the caret. So the plugins close
 * over this one mutable ref instead, and the component keeps it current.
 *
 * A singleton is safe here because the editor enforces one open draft at a
 * time: two dialogue editors never accept keystrokes simultaneously. If that
 * rule ever changes, this must become per-editor plugin state.
 */
import type { GlossaryTerm, GlyphMetrics, SetStructure } from '@shared/game/language';

type EditorRuntime = {
  metrics: GlyphMetrics | null;
  glossary: GlossaryTerm[];
  mode: SetStructure;
};

const editorRuntime: EditorRuntime = {
  metrics: null,
  glossary: [],
  mode: 'continuous',
};

const updateEditorRuntime = (next: Partial<EditorRuntime>): void => {
  Object.assign(editorRuntime, next);
};

export { editorRuntime, updateEditorRuntime };
export type { EditorRuntime };
