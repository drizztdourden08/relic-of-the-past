/* @layer shared-game @kind logic */
import { GLYPH_SLOTS, TOKEN_BASE } from './dialogue-charset.constants';

const extraSlotOfToken = (ch: string): number | undefined => {
  const point = ch.codePointAt(0) ?? 0;
  return ch.length === 1 && point >= TOKEN_BASE && point < TOKEN_BASE + GLYPH_SLOTS ? point - TOKEN_BASE : undefined;
};

export { extraSlotOfToken };
