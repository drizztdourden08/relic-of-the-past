/* @layer electron-main @kind logic */
import { app } from 'electron';
import { join } from 'path';
import { writeFile, mkdir } from 'fs/promises';
import { getWorkspaceRoot } from '../screen-editor/workspace-root';

const writeDebugOutput = async (tag: string, fileName: string, data: unknown): Promise<string> => {
  const appRoot = app.isPackaged ? join(app.getAppPath(), '../..') : getWorkspaceRoot();
  const dir = join(appRoot, 'debug-output');
  await mkdir(dir, { recursive: true });
  const outPath = join(dir, fileName);
  await writeFile(outPath, JSON.stringify(data, null, 2));
  console.log(`[${tag}] Written to: ${outPath}`);
  return outPath;
};

export { writeDebugOutput };
