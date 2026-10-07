/* @layer electron-main @kind logic */
/**
 * Resolves the window/taskbar icon. A named instance (an agent launch) wears Sentri so it
 * is recognisable from the taskbar. Windows renders a multi-resolution .ico better than a
 * downscaled PNG, so it gets the .ico first and the PNG after. Every candidate is optional;
 * the logo's PNG is the last resort, so a missing asset never breaks a launch. The files
 * come from `npm run logos` (apps/web/public/logos).
 */
import { join } from 'path';
import { existsSync } from 'fs';
import { is } from '@electron-toolkit/utils';

const LOGO_CANDIDATES = ['logo/logo.ico', 'logo/logo-256.png'];
const SENTRI_CANDIDATES = ['sentri/sentri.ico', 'sentri/sentri-256.png'];

/** Dev serves from the source tree; a packaged build serves from the bundled renderer. */
const logoPath = (file: string): string =>
  is.dev
    ? join(__dirname, '../../apps/web/public/logos', file)
    : join(__dirname, '../renderer/logos', file);

/** The .ico is Windows only; elsewhere the PNG is the one that shows. */
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
