/* @layer renderer-lib @kind logic */
import { readJson, writeJson } from '@drizztdourden08/brock-core';
import { getPlatform } from '@drizztdourden08/brock-react';
import { APP_LANGUAGE_FILE, DEFAULT_APP_LANGUAGE } from './app-language.constants';
import { isAppLanguage } from './is-app-language';

const readAppLanguage = async (): Promise<string> => {
  const stored = await readJson<{ language?: unknown }>(getPlatform().files, APP_LANGUAGE_FILE, {});
  return isAppLanguage(stored.language) ? stored.language : DEFAULT_APP_LANGUAGE;
};

const writeAppLanguage = (language: string): Promise<void> => writeJson(getPlatform().files, APP_LANGUAGE_FILE, { language });

export { readAppLanguage, writeAppLanguage };
