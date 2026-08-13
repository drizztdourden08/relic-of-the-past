/* @layer electron-main @kind logic */
/**
 * The one updater preference: whether pre-releases are offered. App-level rather than
 * per-profile, because it decides what the app installs, not how it plays.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import { getUserDataPath } from '../lib/paths';
import type { UpdaterPrefs } from './updater.type';

/**
 * Stable by default. Anyone who wants pre-releases opts in, and that choice is
 * saved; it is not something a fresh install should inherit.
 */
const DEFAULTS: UpdaterPrefs = { allowPrerelease: false };

const prefsPath = (): string => getUserDataPath('config', 'updater.json');

const readPrefs = (): UpdaterPrefs => {
  try {
    const saved = JSON.parse(readFileSync(prefsPath(), 'utf-8')) as Partial<UpdaterPrefs>;
    return { allowPrerelease: saved.allowPrerelease === true };
  } catch {
    return DEFAULTS;
  }
};

const writePrefs = (prefs: UpdaterPrefs): void => {
  const path = prefsPath();
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(prefs, null, 2), 'utf-8');
};

export { readPrefs, writePrefs };
