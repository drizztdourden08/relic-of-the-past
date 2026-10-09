/* @layer electron-main @kind logic */
import { readFileSync } from 'fs';
import { stripBom } from '../../lib/json-store';
import type { UpdaterPrefs } from '../updater.type';
import { prefsPath } from './prefs-path';
import { DEFAULTS } from './updater-prefs.constants';

const readPrefs = (): UpdaterPrefs => {
  try {
    const raw = readFileSync(prefsPath(), 'utf-8');
    const saved = JSON.parse(stripBom(raw)) as Partial<UpdaterPrefs>;
    return { allowPrerelease: saved.allowPrerelease === true };
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== 'ENOENT') {
      console.warn(`[updater-prefs] Failed to read ${prefsPath()}, using defaults:`, err);
    }
    return DEFAULTS;
  }
};

export { readPrefs };
