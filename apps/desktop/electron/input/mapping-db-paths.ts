/* @layer electron-main @kind logic */
/**
 * Resolves the two gamecontrollerdb.txt locations mapping-db.ts loads, the
 * same idea as the native addon's own resourcesPath-then-dev-relative
 * resolution (native/sdl3/index.ts) applied to a bundled data file instead
 * of a native binary.
 *
 * Bundled db: ships in the repo at resources/gamecontrollerdb.txt.
 * electron-builder's extraResources copies it into process.resourcesPath
 * for a packaged build (see scripts/build/electron-builder.config.js); in
 * dev there is no resourcesPath copy, so this falls back to the repo root,
 * found relative to the bundled main-process file's own on-disk location
 * (electron.vite.config.ts outputs main.ts to dist/electron/, two levels
 * under the repo root, in both dev and a production build).
 *
 * User db: a copy at <userData>/gamecontrollerdb.txt the player can extend
 * or replace; mapping-db.ts loads it SECOND so it wins, and appends new
 * entries to it.
 */
import { existsSync } from 'fs';
import { join } from 'path';
import { getLegacyPath } from '../lib/paths';

const DB_FILENAME = 'gamecontrollerdb.txt';

/** The bundled db shipped with the app, or null if neither location exists
 *  (e.g. a from-source checkout missing resources/gamecontrollerdb.txt). */
const resolveBundledMappingDbPath = (): string | null => {
  const candidates = [
    ...(process.resourcesPath ? [join(process.resourcesPath, DB_FILENAME)] : []),
    join(__dirname, '..', '..', 'resources', DB_FILENAME),
  ];
  return candidates.find((candidate) => existsSync(candidate)) ?? null;
};

/** The user's own db copy — may not exist yet; addUserMapping creates it on first write. */
const resolveUserMappingDbPath = (): string => getLegacyPath(DB_FILENAME);

export { DB_FILENAME, resolveBundledMappingDbPath, resolveUserMappingDbPath };
