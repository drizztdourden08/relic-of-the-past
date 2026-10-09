/* @layer electron-main @kind logic */
import { getUserDataPath, writeJsonFile } from '@drizztdourden08/brock-electron/main';

const sanitizeFileStem = (name: string): string => name.replace(/[^A-Za-z0-9_-]/g, '_');

const writeDebugCapture = async (name: string, data: unknown): Promise<string> => {
  const filePath = getUserDataPath('debug', `${sanitizeFileStem(name)}-${Date.now()}.json`);
  await writeJsonFile(filePath, data);
  return filePath;
};

export { writeDebugCapture };
