/* @layer renderer-components @kind logic */
import type { LanguageSet, Token } from '@rotp/languages';
import { mapEntry } from './map-entry';

const withEntryTokens = (set: LanguageSet, id: number, tokens: Token[]): LanguageSet =>
  mapEntry(set, id, (entry) => ({ ...entry, tokens }));

export { withEntryTokens };
