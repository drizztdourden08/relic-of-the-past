/* @layer renderer-components @kind types */
/**
 * Presentation types for the dialogue editor's chrome. Every field is something
 * a translator sees; nothing here decides which codes exist or which values are
 * legal. The catalog and the language's own encoder settle that upstream, and
 * these shapes only carry the answer to a button or a legend row.
 */
import type { IconifyIcon } from '@iconify/types';
import type { GlyphMetrics, GlyphSheet, Token } from '@shared/game/language';
import type { InsertChoice } from '../sub-components/insert-menu.types';

/** The pack's drawable font: the tiles, and the alphabet that indexes them. */
type GlyphFont = {
  sheet: GlyphSheet | null;
  metrics: GlyphMetrics | null;
};

/**
 * A LIVE handle on that font, for the node view.
 *
 * The editor's node view is built once per extension list and closes over
 * whatever it was given, so a font handed over by value would be the font as it
 * was at that moment. That font is null while the pack's own bytes are still
 * being read. Reading `current` at the node view's own render time is what lets
 * a character be drawn with a font that arrived afterwards.
 */
type GlyphFontHandle = {
  current: GlyphFont;
};

/** One insertable thing, drawn as one toolbar button. */
type ToolbarItem = {
  id: string;
  /** Plain-language name, straight from the catalog. */
  label: string;
  description: string;
  /** The button's symbol. Null for a picture character, which draws `glyph` instead. */
  icon: IconifyIcon | null;
  /** The bracketed alphabet entry, present only for a picture character. */
  glyph?: string;
  /** A tiny numeral beside the icon, where one symbol serves several items. */
  badge?: string;
  /** True when a value must be picked before anything can be inserted. */
  needsChoice: boolean;
  choices: InsertChoice[];
  /**
   * The tokens this button adds, in order. Almost always one. A picture the
   * alphabet spells as a PAIR of entries is inserted as both at once, because it
   * is one character to the author and half of one is nonsense on screen.
   */
  make: (choice: string | null) => Token[];
};

/** One cluster of the toolbar, under the heading a translator reads. */
type ToolbarGroup = {
  id: string;
  heading: string;
  items: ToolbarItem[];
};

/** One row of the legend: a symbol this line actually uses, and what it does. */
export type { GlyphFont, GlyphFontHandle, ToolbarGroup, ToolbarItem };
