import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import type { ShadowCastingProject, ScreenShadowData } from '../../../../shared/types/shadow-casting';
import { EMPTY_SHADOW_PROJECT } from '../../../../shared/types/shadow-casting';

const getDataPath = (): string => {
  // In dev, __dirname is apps/desktop/electron/shadow-casting
  // The data file lives at apps/desktop/public/data/shadow-casting.json
  return join(__dirname, '..', '..', 'public', 'data', 'shadow-casting.json');
};

let cachedProject: ShadowCastingProject | null = null;

const loadShadowProject = async (): Promise<ShadowCastingProject> => {
  if (cachedProject) return cachedProject;

  const filePath = getDataPath();
  if (!existsSync(filePath)) {
    cachedProject = { ...EMPTY_SHADOW_PROJECT };
    return cachedProject;
  }

  try {
    const raw = await readFile(filePath, 'utf-8');
    cachedProject = JSON.parse(raw) as ShadowCastingProject;
    return cachedProject;
  } catch {
    console.warn('[ShadowCasting] Failed to read data file, using empty project');
    cachedProject = { ...EMPTY_SHADOW_PROJECT };
    return cachedProject;
  }
};

const saveShadowProject = async (project: ShadowCastingProject): Promise<void> => {
  const filePath = getDataPath();
  const dir = dirname(filePath);
  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true });
  }
  const json = JSON.stringify(project, null, 2);
  await writeFile(filePath, json, 'utf-8');
  cachedProject = project;
};

const getScreenData = async (screenId: number): Promise<ScreenShadowData | null> => {
  const project = await loadShadowProject();
  return project.screens[screenId] ?? null;
};

const invalidateCache = (): void => {
  cachedProject = null;
};

export { loadShadowProject, saveShadowProject, getScreenData, invalidateCache };
