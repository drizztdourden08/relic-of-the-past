/* @layer renderer-components @kind types */
import type { LineAdvance, Token } from '@rotp/languages';

type LineShape = {
  advance: LineAdvance;
  tokens: Token[];
  endsBox: boolean;
};

export type { LineShape };
