/* @layer electron-main @kind logic */
import type { MainContext } from '@drizztdourden08/brock-electron/main';
import { APP_LANGUAGE_FILE } from '../../src/app-language/app-language.constants';
import { isAppLanguage } from '../../src/app-language/is-app-language';

const restoreAppLanguage = async (ctx: MainContext): Promise<void> => {
  const text = await ctx.files.readText(APP_LANGUAGE_FILE).catch(() => null);
  if (text === null) return;
  try {
    const stored: unknown = JSON.parse(text);
    const language = typeof stored === 'object' && stored !== null && 'language' in stored ? stored.language : undefined;
    if (isAppLanguage(language)) await ctx.i18n.setLocale(language);
  } catch {
    ctx.log('app-language.json is not readable; the app stays in English', 'warn');
  }
};

export { restoreAppLanguage };
