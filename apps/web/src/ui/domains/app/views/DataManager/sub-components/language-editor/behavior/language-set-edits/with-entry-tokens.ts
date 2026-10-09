/* @layer renderer-components @kind logic */
import type { LanguageSet, Token } from '@shared/game/language';
import { mapEntry } from './map-entry';

const withEntryTokens = (set: LanguageSet, id: number, tokens: Token[]): LanguageSet =>
  mapEntry(set, id, (entry) => ({ ...entry, tokens }));

export { withEntryTokens };
