/* @layer renderer-app @kind logic */
import { requireHostApi } from '@drizztdourden08/brock-react';
import { EMPTY_SHADOW_PROJECT } from '@rotp/game-core';
import { useShadowEditorStore } from '@app/stores/shadow-editor-store';

const loading: { current: Promise<void> | null } = { current: null };

const ensureShadowProject = (): void => {
  const { loaded, loadProject } = useShadowEditorStore.getState();
  if (loaded || loading.current) return;
  loading.current = requireHostApi().shadowCasting.load()
    .then(loadProject, () => loadProject({ ...EMPTY_SHADOW_PROJECT }))
    .finally(() => { loading.current = null; });
};

export { ensureShadowProject };
