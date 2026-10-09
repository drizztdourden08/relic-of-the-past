/* @layer electron-main @kind logic */
import { readdir } from 'fs/promises';

const pngsIn = async (outDir: string): Promise<Set<string>> => {
  try {
    return new Set((await readdir(outDir)).filter(f => f.endsWith('.png')));
  } catch {
    return new Set<string>();
  }
};

export { pngsIn };
