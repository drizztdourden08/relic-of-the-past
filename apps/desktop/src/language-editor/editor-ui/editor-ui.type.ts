/* @layer renderer-components @kind types */
import type { IconifyIcon } from '@iconify/types';
import type { GlyphMetrics, GlyphSheet, Token } from '@rotp/languages';
import type { InsertChoice } from '../sub-components/insert-menu.type';

type GlyphFont = {
  sheet: GlyphSheet | null;
  metrics: GlyphMetrics | null;
};

type GlyphFontHandle = {
  current: GlyphFont;
};

type ToolbarItem = {
  id: string;
  label: string;
  description: string;
  icon: IconifyIcon | null;
  glyph?: string;
  badge?: string;
  needsChoice: boolean;
  choices: InsertChoice[];
  make: (choice: string | null) => Token[];
};

export type { GlyphFont, GlyphFontHandle, ToolbarItem };
