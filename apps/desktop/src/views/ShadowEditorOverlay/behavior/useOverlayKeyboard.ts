/* @layer renderer-components @kind hook */
import { useEffect } from 'react';
import { useShadowEditorStore } from '@app/stores/shadow-editor-store';
import { applyOverlayKey } from './apply-overlay-key';
import { overlayKeyAction } from './overlay-key-action';
import { screenIdFromVp } from './screen-id-from-vp';
import type { OverlayKeyboardArgs } from './overlay.type';

const useOverlayKeyboard = (a: OverlayKeyboardArgs): void => {
  const { vpRef } = a;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const vp = vpRef.current;
      const screenId = vp ? screenIdFromVp(vp) : -1;
      if (screenId < 0) return;
      const action = overlayKeyAction(e);
      if (action) applyOverlayKey(action, e, useShadowEditorStore.getState(), screenId);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [vpRef]);
};

export { useOverlayKeyboard };
