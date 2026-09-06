/* @layer shared-game @kind types */
/**
 * A LanguageSet is the fully-decoded counterpart to the raw LanguagePack in
 * shared/types/language.ts: dialogue lines are token streams, and glossary/name
 * data is broken out for editing before a bake step recompiles it into the ROM.
 */
import type { TextOverrides } from './text/types';
import type { Variable } from './variables/types';

/**
 * One decoded unit of dialogue text. `cmd`/`break`/`var` cover the game's
 * control codes; `ref` defers to a GlossaryTerm that expands at bake time.
 */
type Token =
  | { t: 'text'; v: string }
  | { t: 'cmd'; name: string; param?: number }
  | { t: 'break'; row: 1 | 2 | 3 }
  | { t: 'var'; name: 'player-name' | 'number'; slot?: number }
  | { t: 'ref'; key: string };

/** One dialogue string, keyed by the game's own positional index. */
type DialogueEntry = {
  /** The game's own positional index, 1..397. Immutable. */
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
  /** 'de', or custom: 'us-canon'. Becomes the INI Language value. */
  id: string;
  name: string;
  /** Base language code this set inherits its alphabet/dictionary/encoder/font
   *  from: a key of kLanguages in shared/asset-extraction/text/data/language-data.ts. */
  base: string;
  origin: 'rom' | 'custom';
  version: number;
  author?: string;
};

/**
 * How a set lays its dialogue out for editing: `continuous` treats an entry as
 * flowing text and derives the box breaks, `block` keeps the author's own
 * breaks, `off` disables the assistance entirely.
 */
type SetStructure = 'continuous' | 'block' | 'off';

/**
 * A full editable language set. `glossary` and `names` are the PROJECTION of
 * `variables` through `legacyFromVariables`, the shape every current reader
 * expects; the storage layer populates all three on read and rebuilds
 * `variables` from the pair on write, so the views cannot drift. `variables`
 * and `structure` are optional in the TYPE only (a fixture need not carry
 * them); every stored set has both. `text` holds ONLY what was retyped; which
 * slots exist is decided by the catalog (./text), so an absent field means
 * "nothing translated yet", never "nothing to translate".
 */
type LanguageSet = LanguageSetMeta & {
  dialogue: DialogueEntry[];
  glossary: GlossaryTerm[];
  names: NameTable;
  variables?: Variable[];
  structure?: SetStructure;
  text?: TextOverrides;
};

export type {
  DialogueEntry, GlossaryTerm, LanguageSet, LanguageSetMeta, NameTable, PauseLabelKey,
  SetStructure, Token,
};
