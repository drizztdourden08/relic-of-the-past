/* @layer shared-asset-extraction @kind types */
import type { LanguageConfig } from '../../text/data/language-data/language-data.type';

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

type JapaneseConfigFields = Omit<LanguageConfig, 'id' | 'alphabet' | 'commandLengths' | 'commandNames' | 'commandStart'>;

export type { JapaneseConfigFields, JapaneseToken, ReadByte, TokenRead };
