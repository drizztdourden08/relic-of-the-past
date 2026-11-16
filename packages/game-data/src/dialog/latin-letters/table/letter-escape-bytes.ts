/* @layer shared-game @kind logic */
import {
  EU_HIGH_COUNT, EU_HIGH_FIRST, EU_LOW_COUNT, EU_LOW_FIRST, EU_NAME, EU_PREFIX, PAGE, US_LETTER_FIRST,
} from './letter-table.constants';

const euEscape = (letter: number): number[] => {
  if (letter < EU_LOW_COUNT) return [EU_PREFIX, EU_LOW_FIRST + letter];
  if (letter < EU_LOW_COUNT + EU_HIGH_COUNT) return [EU_PREFIX, EU_HIGH_FIRST + letter - EU_LOW_COUNT];
  return [EU_NAME, letter - EU_LOW_COUNT - EU_HIGH_COUNT];
};

const letterEscapeBytes = (letter: number, eu: boolean): number[] =>
  eu ? euEscape(letter) : [US_LETTER_FIRST + Math.floor(letter / PAGE), letter % PAGE];

export { letterEscapeBytes };
