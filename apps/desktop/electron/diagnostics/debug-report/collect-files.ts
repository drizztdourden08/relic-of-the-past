/* @layer electron-main @kind logic */
/**
 * Gathers everything a debug report bundles besides the save state, which the renderer
 * already holds: the profile's settings and randomizer config (read straight off disk, so
 * the renderer never has to thread live GameSettings down through the packaging call), plus
 * whatever of the app's always-on log files exist for this session.
 */
import { readFile } from 'fs/promises';
import { getUserDataPath } from '../../lib/paths';
import { readJson } from '../../lib/json-store';
import type { Profile } from '@shared/types/profile';

interface DebugReportLogFile {
  name: string;
  contents: string;
}

interface DebugReportCollectedFiles {
  settingsJson: unknown;
  profileJson: unknown;
  randomizerJson: unknown;
  inputProfilesJson: unknown;
  logFiles: DebugReportLogFile[];
}

const tryReadText = async (path: string): Promise<string | null> => {
  try {
    return await readFile(path, 'utf-8');
  } catch {
    return null;
  }
};

const LOG_FILES = ['main-console.log', 'session.log', 'session-1.log'];

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
