/* @layer shared-asset-extraction @kind logic */
import { kLanguages } from './language-data.data';

const usesNewFormat = (lang: string): boolean => kLanguages[lang].encoder === 'new';

export { usesNewFormat };
