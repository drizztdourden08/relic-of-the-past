/* @layer renderer-components @kind hook */
import { useEffect } from 'react';
import type { MutableRefObject } from 'react';
import { useShadowEditorStore } from '../../../../../stores/shadow-editor-store';
import { EMPTY_SHADOW_PROJECT } from '@shared/types/shadow-casting';
import type { ShadowCastingProject } from '@shared/types/shadow-casting';
import { screenIdFromVp } from './coords';
import type { Vp } from './coords';

interface Args {
  open: boolean;
  loadProject: (p: ShadowCastingProject) => void;
  vpRef: MutableRefObject<Vp | null>;
}

/** Loads the project on open and wires editor keyboard shortcuts (undo/redo/
 *  delete/save/escape) while the editor is open. */
const useOverlayKeyboard = (a: Args): void => {
  const { open, loadProject, vpRef } = a;

  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        const project = await window.api.shadowCasting.load();
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
      } else if (e.ctrlKey && e.key === 's') { e.preventDefault(); store.save(); }
      else if (e.key === 'Escape') { store.setActiveTool('select'); store.setSelectedElement(null, null); }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, vpRef]);
};

export { useOverlayKeyboard };
