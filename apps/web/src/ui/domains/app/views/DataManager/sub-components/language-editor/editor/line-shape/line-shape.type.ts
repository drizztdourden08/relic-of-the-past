/* @layer renderer-components @kind types */
import type { LineAdvance, Token } from '@shared/game/language';

type LineShape = {
  advance: LineAdvance;
  tokens: Token[];
  endsBox: boolean;
};

export type { LineShape };
