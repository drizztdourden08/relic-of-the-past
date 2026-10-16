/* @layer renderer-components @kind types */
import type { useShadowEditorStore } from '@app/stores/shadow-editor-store';

type ShadowEditorState = ReturnType<typeof useShadowEditorStore.getState>;

export type { ShadowEditorState };
