/* @layer renderer-stores @kind logic */
import type { ShadowCastingProject, ScreenShadowData } from '@shared/types/shadow-casting';

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
