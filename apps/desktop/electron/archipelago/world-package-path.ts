/* @layer electron-main @kind logic */
/**
 * Where the bundled Archipelago world package lives. A packaged build carries
 * it in process.resourcesPath/archipelago (electron-builder extraResources,
 * see scripts/build/electron-builder.config.js). In dev it is read from the
 * build output at <repo>/build/archipelago, found relative to the bundled main
 * file (dist/electron/, two levels under the repo root).
 */
import { existsSync } from 'fs';
import { join } from 'path';

const WORLD_PACKAGE_FILENAME = 'relic_of_the_past.apworld';

/** The world package on disk, or null when it has not been built. */
const resolveWorldPackagePath = (): string | null => {
  const candidates = [
    ...(process.resourcesPath ? [join(process.resourcesPath, 'archipelago', WORLD_PACKAGE_FILENAME)] : []),
    join(__dirname, '..', '..', 'build', 'archipelago', WORLD_PACKAGE_FILENAME),
  ];
  return candidates.find((candidate) => existsSync(candidate)) ?? null;
};

export { WORLD_PACKAGE_FILENAME, resolveWorldPackagePath };
