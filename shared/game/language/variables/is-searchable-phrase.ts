/* @layer shared-game @kind logic */
import { MIN_PHRASE_LENGTH } from './variables.constants';

const isSearchablePhrase = (phrase: string): boolean => phrase.length >= MIN_PHRASE_LENGTH;

export { isSearchablePhrase };
