/* @layer electron-main @kind logic */
import type { ShadowCastingProject } from '@rotp/game-core/shadow-casting-types';
import { EMPTY_SHADOW_PROJECT } from '@rotp/game-core/shadow-casting-types';
import { readJsonFile } from '@drizztdourden08/brock-electron/main';
import { getDataPath } from './get-data-path';
import { shadowProjectState } from './shadow-project-state';

const loadShadowProject = async (): Promise<ShadowCastingProject> => {
  if (shadowProjectState.cachedProject) return shadowProjectState.cachedProject;
  shadowProjectState.cachedProject = await readJsonFile<ShadowCastingProject>(getDataPath(), { ...EMPTY_SHADOW_PROJECT });
  return shadowProjectState.cachedProject;
};

export { loadShadowProject };
