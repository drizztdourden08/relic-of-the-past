/* @layer electron-main @kind logic */
import { join } from 'path';
import type { ShadowCastingProject, ScreenShadowData } from '@shared/types/shadow-casting';
import { EMPTY_SHADOW_PROJECT } from '@shared/types/shadow-casting';
import { readJson, writeJson } from '../lib/json-store';

// Shadow data is a committed source asset (not per-user state), so it lives under
// public/data rather than userData. Writes are dev-only (see ipc-handlers); in dev
// __dirname resolves into the build output beside the bundled public dir.
const getDataPath = (): string =>
  join(__dirname, '..', '..', 'public', 'data', 'shadow-casting.json');

let cachedProject: ShadowCastingProject | null = null;

const loadShadowProject = async (): Promise<ShadowCastingProject> => {
  if (cachedProject) return cachedProject;
  cachedProject = await readJson<ShadowCastingProject>(getDataPath(), { ...EMPTY_SHADOW_PROJECT });
  return cachedProject;
};

const saveShadowProject = async (project: ShadowCastingProject): Promise<void> => {
  await writeJson(getDataPath(), project);
  cachedProject = project;
};

const getScreenData = async (screenId: number): Promise<ScreenShadowData | null> => {
  const project = await loadShadowProject();
  return project.screens[screenId] ?? null;
};

export { loadShadowProject, saveShadowProject, getScreenData };
