/* @layer electron-main @kind logic */
/**
 * Mapping database — the Ship of Harkinian pattern: a bundled
 * gamecontrollerdb.txt ships with the app, then an optional user copy at
 * <userData>/gamecontrollerdb.txt loads SECOND on top of it, so a line the
 * player adds or edits there wins over the bundled default for that GUID.
 */
import { appendFile, readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { addMapping, addMappingsFromFile } from './native/sdl3';
import { resolveBundledMappingDbPath, resolveUserMappingDbPath } from './mapping-db-paths';
import { isMappingLine } from './mapping-line-validate';

/** Loads the bundled db, then the user db (if present) on top of it. Call once at startup. */
const loadMappingDatabases = (): void => {
  // A count is only meaningful once the controller layer has parsed the file,
  // which happens after this runs. Report what was registered and from where;
  // the applied total is logged by the layer itself when it processes them.
  const bundledPath = resolveBundledMappingDbPath();
  if (bundledPath) {
    addMappingsFromFile(bundledPath);
    console.log(`[controllers] registered bundled mapping db: ${bundledPath}`);
  } else {
    console.log('[controllers] no bundled mapping db found');
  }

  const userPath = resolveUserMappingDbPath();
  if (existsSync(userPath)) {
    addMappingsFromFile(userPath);
    console.log(`[controllers] registered user mapping db: ${userPath}`);
  }
};

/** Whether the file's last byte is missing a trailing newline (so a new line can join it cleanly). */
const missingTrailingNewline = async (path: string): Promise<boolean> => {
  const contents = await readFile(path, 'utf8');
  return contents.length > 0 && !contents.endsWith('\n');
};

/**
 * Registers a mapping for the live session AND appends it to the user db so
 * it survives a restart, creating that file if it doesn't exist yet.
 * Rejects (returns false, writes nothing) when the line doesn't look like a
 * real mapping.
 */
const addUserMapping = async (mapping: string): Promise<boolean> => {
  const line = mapping.trim();
  if (!isMappingLine(line)) return false;
  if (!addMapping(line)) return false;

  const userPath = resolveUserMappingDbPath();
  const needsNewline = existsSync(userPath) && await missingTrailingNewline(userPath);
  await appendFile(userPath, `${needsNewline ? '\n' : ''}${line}\n`, 'utf8');
  return true;
};

export { addUserMapping, loadMappingDatabases };
