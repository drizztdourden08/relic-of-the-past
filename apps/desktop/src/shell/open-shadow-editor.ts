/* @layer renderer-app @kind logic */
import { confirmAction } from '@drizztdourden08/brock-react';
import { useShadowEditorStore } from '@app/stores/shadow-editor-store';
import { SHADOW_EDITOR_WARNING, SHADOW_EDITOR_WARNING_KEY } from './shell.constants';

const readDismissed = (): boolean => {
  try {
    return localStorage.getItem(SHADOW_EDITOR_WARNING_KEY) === 'true';
  } catch {
    return false;
  }
};

const openShadowEditor = async (): Promise<void> => {
  if (!readDismissed()) {
    const confirmed = await confirmAction(SHADOW_EDITOR_WARNING);
    if (!confirmed) return;
    try {
      localStorage.setItem(SHADOW_EDITOR_WARNING_KEY, 'true');
    } catch {
      return;
    }
  }
  useShadowEditorStore.getState().setOpen(true);
};

export { openShadowEditor };
