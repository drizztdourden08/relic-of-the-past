/* @layer electron-main @kind logic */
import type { ShadowCastingProject } from '@shared/types/shadow-casting';
import { writeJson } from '../../lib/json-store';
import { getDataPath } from './get-data-path';
import { shadowProjectState } from './shadow-project-state';

const saveShadowProject = async (project: ShadowCastingProject): Promise<void> => {
  await writeJson(getDataPath(), project);
  shadowProjectState.cachedProject = project;
};

export { saveShadowProject };
