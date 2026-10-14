/* @layer renderer-stores @kind logic */
import type { ScreenEditActions, ShadowEditorGet, ShadowEditorSet } from './shadow-editor-store.type';
import { heightmapActions } from './heightmap-actions';
import { lightActions } from './light-actions';

const screenEditActions = (set: ShadowEditorSet, get: ShadowEditorGet): ScreenEditActions => ({
  ...heightmapActions(set, get),
  ...lightActions(set, get),
});

export { screenEditActions };
