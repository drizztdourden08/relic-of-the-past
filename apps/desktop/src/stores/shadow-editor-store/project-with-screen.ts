/* @layer renderer-stores @kind logic */
import type { ShadowCastingProject, ScreenShadowData } from '@rotp/game-core';

const projectWithScreen = (project: ShadowCastingProject, screenId: number, data: ScreenShadowData): ShadowCastingProject =>
  ({ ...project, screens: { ...project.screens, [screenId]: data } });

export { projectWithScreen };
