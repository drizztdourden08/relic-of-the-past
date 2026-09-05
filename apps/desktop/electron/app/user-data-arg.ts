/* @layer electron-main @kind logic */
/**
 * `--user-data=<dir>` points this launch's user data at an explicit folder.
 *
 * Everything the app stores (profiles, saves, ROMs, extracted assets, config) derives
 * from Electron's userData path, so redirecting it here isolates a launch completely:
 * an automated instance given its own folder can never read or touch the per-user data
 * in the normal location. Same mechanism as portable mode (app.setPath before anything
 * reads a path), and an explicit flag outranks the install-folder convention, so this
 * must be applied AFTER applyPortableMode.
 */
import { app } from 'electron';
import { mkdirSync } from 'fs';
import { resolve } from 'path';

const ARG_PREFIX = '--user-data=';

/**
 * Must run before anything reads a path. Returns the folder in use, or null when the
 * flag is absent and the app keeps whatever location is already set.
 */
const applyUserDataArg = (): string | null => {
  const arg = process.argv.find((a) => a.startsWith(ARG_PREFIX));
  if (!arg) return null;

  const dir = resolve(arg.slice(ARG_PREFIX.length));
  mkdirSync(dir, { recursive: true });
  app.setPath('userData', dir);
  return dir;
};

export { applyUserDataArg };
