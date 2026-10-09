/* @layer electron-main @kind logic */
import { writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import type { UpdaterPrefs } from '../updater.type';
import { prefsPath } from './prefs-path';

const writePrefs = (prefs: UpdaterPrefs): void => {
  const path = prefsPath();
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(prefs, null, 2), 'utf-8');
};

export { writePrefs };
