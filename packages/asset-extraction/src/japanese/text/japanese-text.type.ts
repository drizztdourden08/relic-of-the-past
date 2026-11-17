/* @layer shared-asset-extraction @kind types */
interface GlyphToken {
  readonly kind: 'glyph';
  readonly glyph: number;
}

interface CommandToken {
  readonly kind: 'command';
  readonly code: number;
  readonly param?: number;
}

type JapaneseToken = GlyphToken | CommandToken;

interface TokenRead {
  readonly token: JapaneseToken | null;
  readonly next: number;
}

type ReadByte = (addr: number) => number;

export type { CommandToken, GlyphToken, JapaneseToken, ReadByte, TokenRead };
