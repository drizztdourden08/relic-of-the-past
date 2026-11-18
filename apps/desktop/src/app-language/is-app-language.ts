/* @layer renderer-lib @kind logic */
import { APP_LANGUAGES } from './app-language.constants';

const isAppLanguage = (tag: unknown): tag is string => typeof tag === 'string' && APP_LANGUAGES.some((choice) => choice.tag === tag);

export { isAppLanguage };
