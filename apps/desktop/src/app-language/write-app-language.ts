/* @layer renderer-lib @kind logic */
import { writeJson } from '@drizztdourden08/brock-core';
import { getPlatform } from '@drizztdourden08/brock-react';
import { APP_LANGUAGE_FILE } from './app-language.constants';

const writeAppLanguage = (language: string): Promise<void> => writeJson(getPlatform().files, APP_LANGUAGE_FILE, { language });

export { writeAppLanguage };
