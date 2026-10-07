/* @layer electron-main @kind logic */
/**
 * Where this copy of the app keeps its user data.
 *
 * A `data` folder at the install root claims everything: profiles, saves, ROMs,
 * extracted assets, MSU packs, sprites, configuration. Because the folder is found
 * relative to the executable, a copy that carries one can be moved to another drive,
 * another machine or a USB key and still find its own files.
 *
 * The root is the folder holding Update.exe, NOT the folder holding the executable.
 * The packaged layout is:
 *
 *   <root>/  .portable            marker written into the portable build
 *            <app>.exe            launcher, path stable across updates
 *            Update.exe
 *            current/             the app, REPLACED wholesale on every update
 *
 * `app.getPath('exe')` resolves inside `current/`, so anything stored beside the
 * executable is destroyed by the first update.
 */
import { app } from 'electron';
import { existsSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';

const DATA_DIR = 'data';
const PORTABLE_MARKER = '.portable';

/**
 * The install root, or null when this is not a packaged install (a dev run, where
 * the executable is Electron itself somewhere in node_modules).
 */
const installRoot = (): string | null => {
  if (!app.isPackaged) return null;
  const root = dirname(dirname(app.getPath('exe')));
  return existsSync(join(root, 'Update.exe')) ? root : null;
};

/**
 * A portable copy is self-contained from its first launch. The folder is created
 * up front instead of waited for, so a user who unzips onto a USB key gets
 * travelling data without having to know the convention. An installed copy switches only when
 * someone deliberately creates the folder.
 */
const resolvePortableData = (): string | null => {
  const root = installRoot();
  if (!root) return null;

  const data = join(root, DATA_DIR);
  if (existsSync(join(root, PORTABLE_MARKER))) {
    mkdirSync(data, { recursive: true });
  }
  return existsSync(data) ? data : null;
};

/**
 * Must run before anything reads a path, since every other location is derived from
 * userData. Returns the folder in use, or null when the app is using the normal
 * per-user location.
 */
const applyPortableMode = (): string | null => {
  const data = resolvePortableData();
  if (data) app.setPath('userData', data);
  return data;
};

export { applyPortableMode, installRoot };
