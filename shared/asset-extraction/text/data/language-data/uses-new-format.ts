/* @layer shared-asset-extraction @kind logic */
import { kLanguages } from '@rotp/game-data';

const usesNewFormat = (lang: string): boolean => kLanguages[lang].encoder === 'new';

export { usesNewFormat };
