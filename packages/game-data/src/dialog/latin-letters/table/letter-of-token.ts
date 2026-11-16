/* @layer shared-game @kind logic */
import { LETTER_TOKEN_BASE, US_CAPACITY } from './letter-table.constants';

const letterOfToken = (ch: string): number | undefined => {
  const point = ch.codePointAt(0) ?? 0;
  return ch.length === 1 && point >= LETTER_TOKEN_BASE && point < LETTER_TOKEN_BASE + US_CAPACITY
    ? point - LETTER_TOKEN_BASE
    : undefined;
};

export { letterOfToken };
