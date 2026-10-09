/* @layer electron-main @kind logic */
import type { ShadowCastingProject } from '@rotp/game-core';
import { writeJsonFile } from '@drizztdourden08/brock-electron/main';
import { getDataPath } from './get-data-path';
import { shadowProjectState } from './shadow-project-state';

const saveShadowProject = async (project: ShadowCastingProject): Promise<void> => {
  await writeJsonFile(getDataPath(), project);
  shadowProjectState.cachedProject = project;
};

export { saveShadowProject };
