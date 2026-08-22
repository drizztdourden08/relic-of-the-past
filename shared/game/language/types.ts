/* @layer shared-game @kind types */
/**
 * Foundation types for the editable language-set model — the in-progress
 * translation studio's unit of work. A LanguageSet is the fully-decoded,
 * fully-structured counterpart to the raw LanguagePack in
 * shared/types/language.ts: dialogue lines are token streams instead of
 * bracket-tagged strings, and glossary/name data is broken out so it can be
 * edited and validated independently before a bake step recompiles it back
 * into the ROM's compressed dialogue format.
 */

/**
 * One decoded unit of dialogue text. `cmd`/`break`/`var` cover the game's
 * control codes (scroll/speed/wait/wait-for-key/choice, line-start markers,
 * the player-name and numeric-value substitutions); `ref` defers to a
 * GlossaryTerm so a translator can retag a term once and have it expand
 * everywhere at bake time.
 */
type Token =
  | { t: 'text'; v: string }
  | { t: 'cmd'; name: string; param?: number }
  | { t: 'break'; row: 1 | 2 | 3 }
  | { t: 'var'; name: 'player-name' | 'number'; slot?: number }
  | { t: 'ref'; key: string };

/** One dialogue string, keyed by the game's own positional index. */
type DialogueEntry = {
  /** 1..397 — the game's positional index, immutable. */
  id: number;
  tokens: Token[];
  /** Translator note, never compiled. */
  note?: string;
};

/** A named, reusable phrase a Token['ref'] can point at. */
type GlossaryTerm = {
  key: string;
  value: string;
  note?: string;
};

/** The fixed set of pause-menu section labels a language set can retitle. */
type PauseLabelKey = 'item' | 'equipment' | 'dungeon-item' | 'crystals' | 'pendants' | 'do';

/** Non-dialogue display strings: inventory item names and pause-menu labels. */
type NameTable = {
  /** Key = item record id + tier, e.g. 'bow-2'. */
  items: Record<string, string>;
  bottles: Record<number, string>;
  labels: Record<PauseLabelKey, string>;
};

/** Identity and provenance for a language set, without its content payload. */
type LanguageSetMeta = {
  /** 'de', or custom: 'us-canon' — becomes the INI Language value. */
  id: string;
  name: string;
  /**
   * Base language code this set inherits its alphabet/dictionary/encoder/font
   * from — one of the keys of kLanguages in
   * shared/asset-extraction/text/data/language-data.ts. Kept as a plain
   * string (no LanguageCode union exists yet) since that table is
   * data-driven and not typed as a closed union.
   */
  base: string;
  origin: 'rom' | 'custom';
  version: number;
  author?: string;
};

/** A full editable language set: identity plus its dialogue/glossary/name content. */
type LanguageSet = LanguageSetMeta & {
  dialogue: DialogueEntry[];
  glossary: GlossaryTerm[];
  names: NameTable;
};

export type {
  DialogueEntry, GlossaryTerm, LanguageSet, LanguageSetMeta, NameTable, PauseLabelKey, Token,
};
