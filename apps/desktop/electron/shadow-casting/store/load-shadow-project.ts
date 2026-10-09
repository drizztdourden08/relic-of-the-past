/* @layer electron-main @kind logic */
import type { ShadowCastingProject } from '@shared/types/shadow-casting';
import { EMPTY_SHADOW_PROJECT } from '@shared/types/shadow-casting';
import { readJson } from '../../lib/json-store';
import { getDataPath } from './get-data-path';
import { shadowProjectState } from './shadow-project-state';

const loadShadowProject = async (): Promise<ShadowCastingProject> => {
  if (shadowProjectState.cachedProject) return shadowProjectState.cachedProject;
  shadowProjectState.cachedProject = await readJson<ShadowCastingProject>(getDataPath(), { ...EMPTY_SHADOW_PROJECT });
  return shadowProjectState.cachedProject;
};

export { loadShadowProject };
