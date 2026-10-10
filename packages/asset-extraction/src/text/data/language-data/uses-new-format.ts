/* @layer shared-asset-extraction @kind logic */
import { kLanguages } from './language-data.constants';

const usesNewFormat = (lang: string): boolean => {
  const config = kLanguages[lang];
  if (!config) throw new Error(`Unknown language: ${lang}`);
  return config.encoder === 'new';
};

export { usesNewFormat };
