/* @layer electron-main @kind logic */
import { writeFile, mkdir } from 'fs/promises';
import { dirname } from 'path';

const writeJson = async (file: string, data: unknown): Promise<void> => {
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, JSON.stringify(data, null, 2), 'utf-8');
};

export { writeJson };
