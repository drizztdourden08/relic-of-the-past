/* @layer renderer-stores @kind logic */
import { requireHostApi } from '@drizztdourden08/brock-react';
import { log } from '../../log-bus';
import { errorMessage } from '../../storage/error-message';
import type { SaveAction, ShadowEditorGet, ShadowEditorSet } from './shadow-editor-store.type';

const saveAction = (set: ShadowEditorSet, get: ShadowEditorGet): SaveAction => ({
  save: async () => {
    const state = get();
    if (!state.dirty) return;
    try {
      await requireHostApi().shadowCasting.save(state.project);
      set({ dirty: false });
    } catch (err) {
      log.error(`[ShadowEditor] Save failed: ${errorMessage(err)}`);
    }
  },
});

export { saveAction };
