/* @layer renderer-components @kind hook */
import { requireHostApi } from '@drizztdourden08/brock-react';
import { useEffect } from 'react';
import { useShadowEditorStore } from '@app/stores/shadow-editor-store';
import { EMPTY_SHADOW_PROJECT } from '@rotp/game-core';
import { applyOverlayKey } from './apply-overlay-key';
import { overlayKeyAction } from './overlay-key-action';
import { screenIdFromVp } from './screen-id-from-vp';
import type { OverlayKeyboardArgs } from './overlay.type';

const useOverlayKeyboard = (a: OverlayKeyboardArgs): void => {
  const { open, loadProject, vpRef } = a;

  useEffect(() => {
    if (!open) return;
    void (async () => {
      try {
        loadProject(await requireHostApi().shadowCasting.load());
      } catch {
        loadProject({ ...EMPTY_SHADOW_PROJECT });
      }
    })();
  }, [open, loadProject]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      const vp = vpRef.current;
      const screenId = vp ? screenIdFromVp(vp) : -1;
      if (screenId < 0) return;
      const action = overlayKeyAction(e);
      if (action) applyOverlayKey(action, e, useShadowEditorStore.getState(), screenId);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, vpRef]);
};

export { useOverlayKeyboard };
