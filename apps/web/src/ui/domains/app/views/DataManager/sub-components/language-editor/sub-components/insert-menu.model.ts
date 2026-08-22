/* @layer renderer-components @kind logic */
/**
 * Builds the insert menu from the control-code catalog and the language's own
 * alphabet. No second list of codes exists here: the table below says only
 * WHICH SECTION a code belongs in, and the label, description, risk and value
 * range all come back out of the catalog. A code the catalog refuses to offer,
 * or marks dangerous, is dropped no matter what the table says.
 *
 * Codes absent from the table are deliberately absent from the menu: the
 * choice/item prompts are a shape, not an insert, and get their own editor, and
 * the message-wide display codes are a settings strip (see message-settings.ts).
 */
import { codeInfoFor, isGlyphName } from '@shared/game/language';
import type { GlossaryTerm, Token } from '@shared/game/language';
import type { LanguageConfig } from '@shared/asset-extraction/text/data/language-data';
import { paramValuesFor } from './code-params';
import type { InsertChoice, InsertGroup, InsertOption } from './insert-menu.types';

type SectionId = 'values' | 'pacing' | 'layout';

/** Section membership, in the order each section offers its rows. */
const SECTION_OF_CODE: Record<string, SectionId> = {
  Name: 'values',
  Number: 'values',
  Waitkey: 'pacing',
  Wait: 'pacing',
  Speed: 'pacing',
  '1': 'layout',
  '2': 'layout',
  '3': 'layout',
  Scroll: 'layout',
};

/** Rows are ordered by this list, not by object-key order, which sorts digits first. */
const CODE_ORDER = ['Name', 'Number', 'Waitkey', 'Wait', 'Speed', '1', '2', '3', 'Scroll'];

/** Every bracketed alphabet entry — a picture character or a code, spelled alike. */
const BRACKETED = /^\[([^\]]+)\]$/;

const isBreakRow = (name: string): name is '1' | '2' | '3' => (
  name === '1' || name === '2' || name === '3'
);

/**
 * The token shape a code round-trips as. `parseTokens` gives three names their
 * own token kind — the line-start markers become `break`, the two substitutions
 * become `var` — so the menu has to emit those shapes or the insert would come
 * back as something else after a save and reload.
 */
const makeToken = (name: string, choice: string | null): Token => {
  const param = choice === null ? null : Number(choice);
  if (isBreakRow(name)) return { t: 'break', row: Number(name) as 1 | 2 | 3 };
  if (name === 'Name') return { t: 'var', name: 'player-name' };
  if (name === 'Number') {
    return param === null ? { t: 'var', name: 'number' } : { t: 'var', name: 'number', slot: param };
  }
  return param === null ? { t: 'cmd', name } : { t: 'cmd', name, param };
};

const numericChoices = (values: number[]): InsertChoice[] =>
  values.map((value) => ({ value: String(value), label: String(value) }));

const codeOption = (name: string, cfg: LanguageConfig): InsertOption | null => {
  const info = codeInfoFor(name);
  if (!info || !info.offerInMenu || info.risk === 'dangerous') return null;
  const values = paramValuesFor(name, cfg);
  const needsChoice = values !== null;
  return {
    id: `code-${name}`,
    label: info.label,
    description: info.description,
    needsChoice,
    choices: values ? numericChoices(values) : [],
    make: (choice) => makeToken(name, needsChoice ? choice : null),
  };
};

const codeOptionsFor = (section: SectionId, cfg: LanguageConfig): InsertOption[] => (
  CODE_ORDER
    .filter((name) => SECTION_OF_CODE[name] === section)
    .map((name) => codeOption(name, cfg))
    .filter((option): option is InsertOption => option !== null)
);

/**
 * The set's own reusable phrases. A pick becomes a `ref` token, which stays a
 * reference until bake time, so retagging the term once updates every entry
 * that points at it.
 */
const glossaryOption = (glossary: GlossaryTerm[]): InsertOption => ({
  id: 'glossary-term',
  label: 'Glossary term',
  description: 'inserts one of this set\'s reusable phrases by name',
  needsChoice: true,
  choices: glossary.map((term) => ({ value: term.key, label: term.key, hint: term.value })),
  make: (choice) => ({ t: 'ref', key: choice ?? '' }),
});

/**
 * The picture characters this language's alphabet carries — button icons,
 * arrows, the ellipsis. Discovered from the alphabet rather than listed, so a
 * set built on any base offers exactly its own. They are spelled like a control
 * code and round-trip as paramless `cmd` tokens by design (see parseTokens); a
 * bracket name the catalog claims is a real code and is skipped here.
 */
const glyphOptions = (cfg: LanguageConfig): InsertOption[] => {
  const seen = new Set<string>();
  const out: InsertOption[] = [];
  for (const entry of cfg.alphabet) {
    const name = BRACKETED.exec(entry)?.[1];
    if (!name || seen.has(name) || codeInfoFor(name) || !isGlyphName(name, cfg)) continue;
    seen.add(name);
    out.push({
      id: `glyph-${name}`,
      label: entry,
      description: 'a picture character from this set\'s alphabet',
      needsChoice: false,
      choices: [],
      make: () => ({ t: 'cmd', name }),
    });
  }
  return out;
};

const buildInsertGroups = (cfg: LanguageConfig, glossary: GlossaryTerm[]): InsertGroup[] => [
  {
    id: 'values',
    heading: 'Dynamic values',
    options: [...codeOptionsFor('values', cfg), glossaryOption(glossary)],
  },
  { id: 'pacing', heading: 'Pacing', options: codeOptionsFor('pacing', cfg) },
  { id: 'layout', heading: 'Layout', options: codeOptionsFor('layout', cfg) },
  { id: 'icons', heading: 'Game icons', options: glyphOptions(cfg) },
];

export { buildInsertGroups };
