/* @layer shared-game @kind logic */
/**
 * Legacy `LanguagePack` (shared/types/language.ts) to editable `LanguageSet`
 * migration — the one-time conversion a translation-studio session runs when
 * it opens a language that was only ever extracted, never edited. Pure: no
 * file I/O, no ROM access. The caller (the storage layer) owns reading the
 * pack in and writing the resulting set out.
 */
import type { LanguagePack } from '@shared/types/language';
import type { DialogueEntry, LanguageSet, NameTable, PauseLabelKey } from '../types';
import { parseTokens } from '../tokens/parse-tokens';

/** Every pause-menu label the name table carries, in the order labels default. */
const kPauseLabelKeys: PauseLabelKey[] = [
  'item', 'equipment', 'dungeon-item', 'crystals', 'pendants', 'do',
];

/** `'dungeon-item'` -> `'DUNGEON ITEM'` — a placeholder until real data seeds it. */
const defaultLabel = (key: PauseLabelKey): string => key.replace(/-/g, ' ').toUpperCase();

/**
 * A name table with no item/bottle names yet and English placeholder pause
 * labels. A later migration phase seeds real names from the game's data
 * zone; this never hardcodes them here.
 */
const emptyNameTable = (): NameTable => ({
  items: {},
  bottles: {},
  labels: Object.fromEntries(
    kPauseLabelKeys.map((key) => [key, defaultLabel(key)]),
  ) as Record<PauseLabelKey, string>,
});

/** One legacy `DialogueLine` decoded into a token-stream `DialogueEntry`. */
const dialogueEntryFromLine = (line: LanguagePack['lines'][number]): DialogueEntry => ({
  id: line.id,
  tokens: parseTokens(line.content),
});

/**
 * Convert a legacy extracted pack into a fresh editable set. The pack's
 * language code becomes both `id` and `base` (the set inherits its own
 * alphabet/encoder/font, unchanged, until a translator forks it); `name`
 * stays the bare code here since a display-name lookup lives in the
 * renderer, not in shared code.
 */
const setFromPack = (pack: LanguagePack): LanguageSet => ({
  id: pack.meta.code,
  name: pack.meta.code,
  base: pack.meta.code,
  origin: 'rom',
  version: 1,
  dialogue: pack.lines.map(dialogueEntryFromLine),
  glossary: [],
  names: emptyNameTable(),
});

export { emptyNameTable, setFromPack };
