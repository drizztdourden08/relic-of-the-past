/* @layer electron-main @kind logic */
import { app } from 'electron';
import { existsSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { DATA_DIR, PORTABLE_MARKER } from './portable-mode.constants';

const installRoot = (): string | null => {
  if (!app.isPackaged) return null;
  const root = dirname(dirname(app.getPath('exe')));
  return existsSync(join(root, 'Update.exe')) ? root : null;
};

const resolvePortableData = (): string | null => {
  const root = installRoot();
  if (!root) return null;

  const data = join(root, DATA_DIR);
  if (existsSync(join(root, PORTABLE_MARKER))) {
    mkdirSync(data, { recursive: true });
  }
  return existsSync(data) ? data : null;
};

const applyPortableMode = (): string | null => {
  const data = resolvePortableData();
  if (data) app.setPath('userData', data);
  return data;
};

export { applyPortableMode };
