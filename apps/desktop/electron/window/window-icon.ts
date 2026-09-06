/* @layer electron-main @kind logic */
/**
 * Resolves the window/taskbar icon. A named instance (an agent launch) gets the
 * bot artwork so it is recognisable from the taskbar. Windows renders a
 * multi-resolution .ico better than a downscaled PNG. Every candidate is
 * optional; the normal logo is the last resort, so a missing asset never breaks a launch.
 */
import { join } from 'path';
import { existsSync } from 'fs';
import { is } from '@electron-toolkit/utils';

const DEFAULT_LOGO = 'logo-256.png';

/** Dev serves from the source tree; a packaged build serves from the bundled renderer. */
const logoPath = (file: string): string =>
  is.dev
    ? join(__dirname, '../../apps/web/public/logos', file)
    : join(__dirname, '../renderer/logos', file);

const instanceCandidates = (): string[] =>
  process.platform === 'win32'
    ? ['logo-bot.ico', 'logo-bot-256.png']
    : ['logo-bot-256.png'];

const resolveWindowIcon = (instanceName: string | null): string => {
  if (instanceName) {
    for (const candidate of instanceCandidates()) {
      const path = logoPath(candidate);
      if (existsSync(path)) return path;
    }
    console.warn('[instance] No bot icon found. Using the default icon.');
  }
  return logoPath(DEFAULT_LOGO);
};

export { resolveWindowIcon };
