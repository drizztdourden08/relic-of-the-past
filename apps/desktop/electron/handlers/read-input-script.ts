/* @layer electron-main @kind logic */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { InputScriptFile } from '@app/ipc';

const readInputScript = (raw: string | null): InputScriptFile | null => {
  if (raw === null) return null;
  const path = resolve(raw);
  try {
    return { path, text: readFileSync(path, 'utf8'), error: null };
  } catch (error) {
    return { path, text: null, error: error instanceof Error ? error.message : String(error) };
  }
};

export { readInputScript };
