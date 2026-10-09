/* @layer electron-main @kind logic */
import { join } from 'path';
import { existsSync } from 'fs';
import { is } from '@electron-toolkit/utils';
import { LOGO_CANDIDATES, SENTRI_CANDIDATES } from './window-icon.constants';

const logoPath = (file: string): string =>
  is.dev
    ? join(__dirname, '../../public/logos', file)
    : join(__dirname, '../renderer/logos', file);

const forPlatform = (candidates: string[]): string[] =>
  (process.platform === 'win32' ? candidates : candidates.filter((file) => !file.endsWith('.ico')));

const firstPresent = (candidates: string[]): string | null => {
  for (const candidate of forPlatform(candidates)) {
    const path = logoPath(candidate);
    if (existsSync(path)) return path;
  }
  return null;
};

const resolveWindowIcon = (instanceName: string | null): string => {
  if (instanceName) {
    const sentri = firstPresent(SENTRI_CANDIDATES);
    if (sentri) return sentri;
    console.warn('[instance] No Sentri icon found. Using the default icon.');
  }
  return firstPresent(LOGO_CANDIDATES) ?? logoPath(LOGO_CANDIDATES[LOGO_CANDIDATES.length - 1]);
};

export { resolveWindowIcon };
