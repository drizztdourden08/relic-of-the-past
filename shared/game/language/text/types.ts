/* @layer shared-game @kind types */
/**
 * The translatable-text model: every string the game shows that is NOT a
 * dialogue line, described as a flat list of slots the editor can render.
 *
 * The CATALOG is the source of truth for which slots exist — it is rebuilt from
 * the shipped data on every load, so a set that has never been touched still
 * shows every slot with its original text beside it. Storage only ever holds
 * the translator's overrides, keyed by the same slot keys, which is why a set
 * whose stored payload is empty is indistinguishable from a fresh one.
 */

/** The four surfaces a translator works on, each with its own slot source. */
type TextGroupId = 'pause-names' | 'menu' | 'credits' | 'world-names';

/**
 * How much room the drawing surface has. `glyphs` is a character budget on a
 * fixed-cell surface (optionally over several lines), `tiles` a raw tile-width
 * budget, `none` a surface with no hard cap of its own.
 */
type TextLimit =
  | { kind: 'glyphs'; max: number; lines?: number }
  | { kind: 'tiles'; max: number }
  | { kind: 'none' };

/** One translatable string. */
type TextSlot = {
  /** Stable and unique within its group. */
  key: string;
  /** What the translator sees as the slot's name. */
  label: string;
  /** The shipped original, shown when there is no override. */
  fallback: string;
  limit: TextLimit;
  /**
   * Which characters the surface can actually draw: `pack` is the set's own
   * glyph sheet, `latin-caps` a fixed A-Z ramp baked into the drawing code.
   */
  alphabet: 'pack' | 'latin-caps';
  /** A caveat worth stating, e.g. a surface that cannot re-spell. */
  note?: string;
};

/** One rendered section of the editor: a title and the slots under it. */
type TextGroup = {
  id: TextGroupId;
  title: string;
  slots: TextSlot[];
  /** A caveat true of the whole group, said once rather than on every row. */
  note?: string;
};

/** The translator's overrides. Absent key = untranslated, use the fallback. */
type TextOverrides = Partial<Record<TextGroupId, Record<string, string>>>;

export type { TextGroup, TextGroupId, TextLimit, TextOverrides, TextSlot };
