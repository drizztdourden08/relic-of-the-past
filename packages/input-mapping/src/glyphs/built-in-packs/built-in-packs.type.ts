/* @layer shared-input @kind types */
import type { SdlAxisName, SdlButtonName } from '../../family';
import type { GlyphSource } from '../../types/glyph-pack';

type GlyphTable = Partial<Record<SdlButtonName | SdlAxisName, GlyphSource>>;

type IconKeyTable = Partial<Record<string, string>>;

export type { GlyphTable, IconKeyTable };
