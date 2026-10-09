/* @layer electron-main @kind logic */
import { readFile } from 'fs/promises';
import { getUserDataPath } from '../../lib/paths';
import { readJson } from '../../lib/json-store';
import type { Profile } from '@shared/types/profile';
import { LOG_FILES } from './collect-files.constants';
import type { DebugReportCollectedFiles, DebugReportLogFile } from './collect-files.type';

const tryReadText = async (path: string): Promise<string | null> => {
  try {
    return await readFile(path, 'utf-8');
  } catch {
    return null;
  }
};

const collectLogFiles = async (): Promise<DebugReportLogFile[]> => {
  const files: DebugReportLogFile[] = [];
  for (const name of LOG_FILES) {
    const contents = await tryReadText(getUserDataPath('debug', name));
    if (contents !== null) files.push({ name, contents });
  }
  return files;
};

const collectDebugReportFiles = async (profileId: string): Promise<DebugReportCollectedFiles> => {
  const [settingsJson, profile, inputProfilesJson, logFiles] = await Promise.all([
    readJson<Record<string, unknown>>(getUserDataPath('profiles', profileId, 'config.json'), {}),
    readJson<Profile | null>(getUserDataPath('profiles', profileId, 'profile.json'), null),
    readJson<unknown>(getUserDataPath('profiles', profileId, 'input-profiles.json'), null),
    collectLogFiles(),
  ]);
  return {
    settingsJson,
    profileJson: profile,
    randomizerJson: profile?.randomizer ?? null,
    inputProfilesJson,
    logFiles,
  };
};

export { collectDebugReportFiles };
export type { DebugReportCollectedFiles, DebugReportLogFile };
