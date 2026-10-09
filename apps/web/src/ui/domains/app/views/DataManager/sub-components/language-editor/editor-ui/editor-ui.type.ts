/* @layer renderer-components @kind types */
import type { IconifyIcon } from '@iconify/types';
import type { GlyphMetrics, GlyphSheet, Token } from '@shared/game/language';
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

type ToolbarGroup = {
  id: string;
  heading: string;
  items: ToolbarItem[];
};

export type { GlyphFont, GlyphFontHandle, ToolbarGroup, ToolbarItem };
