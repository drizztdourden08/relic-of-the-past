/* @layer renderer-components @kind hook */
import { requireHostApi } from '@drizztdourden08/brock-react';
import { useEffect } from 'react';
import { useShadowEditorStore } from '@app/stores/shadow-editor-store';
import { EMPTY_SHADOW_PROJECT } from '@rotp/game-core';
import { screenIdFromVp } from './screen-id-from-vp';
import type { OverlayKeyboardArgs } from './overlay.type';

const useOverlayKeyboard = (a: OverlayKeyboardArgs): void => {
  const { open, loadProject, vpRef } = a;

  useEffect(() => {
    if (!open) return;
    void (async () => {
      try {
        const project = await requireHostApi().shadowCasting.load();
        loadProject(project ?? { ...EMPTY_SHADOW_PROJECT });
      } catch {
        loadProject({ ...EMPTY_SHADOW_PROJECT });
      }
    })();
  }, [open, loadProject]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      const store = useShadowEditorStore.getState();
      const vp = vpRef.current;
      const screenId = vp ? screenIdFromVp(vp) : -1;
      if (screenId < 0) return;
      if (e.ctrlKey && e.key === 'z') { e.preventDefault(); store.undo(screenId); }
      else if (e.ctrlKey && (e.key === 'y' || (e.shiftKey && e.key === 'Z'))) { e.preventDefault(); store.redo(screenId); }
      else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (store.selectedElementId) {
          e.preventDefault();
          if (store.selectedType === 'heightmap') store.removeHeightmapElement(screenId, store.selectedElementId);
          else if (store.selectedType === 'light') store.removeLight(screenId, store.selectedElementId);
        }
      } else if (e.ctrlKey && e.key === 's') { e.preventDefault(); void store.save(); }
      else if (e.key === 'Escape') { store.setActiveTool('select'); store.setSelectedElement(null, null); }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, vpRef]);
};

export { useOverlayKeyboard };
