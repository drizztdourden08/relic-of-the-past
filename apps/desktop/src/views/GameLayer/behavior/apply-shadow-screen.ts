/* @layer renderer-components @kind logic */
import type { ShadowCastingProject, ShadowRenderer } from '@rotp/game-core';

const applyShadowScreen = (renderer: ShadowRenderer, project: ShadowCastingProject, screenId: number): void => {
  const screenData = project.screens[screenId] ?? null;
  renderer.setScreenData(screenData);
  const hasContent = screenData !== null && (screenData.heightmap.length > 0 || screenData.lights.length > 0);
  renderer.setEnabled(hasContent);
};

export { applyShadowScreen };
