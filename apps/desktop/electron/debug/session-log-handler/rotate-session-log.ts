/* @layer electron-main @kind logic */
import { mkdir, rename, rm, writeFile } from 'fs/promises';
import { dirname } from 'path';
import { sessionLogPaths } from './session-log-paths';

const rotateSessionLog = async (): Promise<void> => {
  try {
    await mkdir(dirname(sessionLogPaths.current()), { recursive: true });
    await rm(sessionLogPaths.previous(), { force: true });
    await rename(sessionLogPaths.current(), sessionLogPaths.previous()).catch(() => {});
    await writeFile(sessionLogPaths.current(), `[${new Date().toISOString()}] [info] [app] session log started\n`, 'utf-8');
  } catch {
    return;
  }
};

export { rotateSessionLog };
