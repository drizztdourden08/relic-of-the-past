/* @layer electron-main @kind logic */
import type { ScreenShadowData } from '@rotp/game-core';
import { loadShadowProject } from './load-shadow-project';

const getScreenData = async (screenId: number): Promise<ScreenShadowData | null> => {
  const project = await loadShadowProject();
  return project.screens[screenId] ?? null;
};

export { getScreenData };
