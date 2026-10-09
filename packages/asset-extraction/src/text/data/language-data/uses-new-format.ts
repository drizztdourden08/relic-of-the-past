/* @layer shared-asset-extraction @kind logic */
import { kLanguages } from './language-data.constants';

const usesNewFormat = (lang: string): boolean => kLanguages[lang].encoder === 'new';

export { usesNewFormat };
