/* @layer renderer-stores @kind logic */
import type { ShadowCastingProject, ScreenShadowData } from '@rotp/game-core';

const ensureScreenData = (project: ShadowCastingProject, screenId: number): ScreenShadowData => {
  if (project.screens[screenId]) return project.screens[screenId];
  return {
    screenId,
    heightmap: [],
    lights: [],
    lighting: { ...project.globalDefaults },
  };
};

export { ensureScreenData };
