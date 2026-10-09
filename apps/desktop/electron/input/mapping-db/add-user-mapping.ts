/* @layer electron-main @kind logic */
import { appendFile, readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { addMapping } from '../native/sdl3';
import { isMappingLine } from './is-mapping-line';
import { resolveUserMappingDbPath } from './resolve-user-mapping-db-path';

const missingTrailingNewline = async (path: string): Promise<boolean> => {
  const contents = await readFile(path, 'utf8');
  return contents.length > 0 && !contents.endsWith('\n');
};

const addUserMapping = async (mapping: string): Promise<boolean> => {
  const line = mapping.trim();
  if (!isMappingLine(line)) return false;
  if (!addMapping(line)) return false;

  const userPath = resolveUserMappingDbPath();
  const needsNewline = existsSync(userPath) && await missingTrailingNewline(userPath);
  await appendFile(userPath, `${needsNewline ? '\n' : ''}${line}\n`, 'utf8');
  return true;
};

export { addUserMapping };
