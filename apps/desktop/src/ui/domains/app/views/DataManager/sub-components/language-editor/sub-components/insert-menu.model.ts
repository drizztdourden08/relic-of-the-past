/* @layer renderer-components @kind logic */
import { codeInfoFor, isGlyphName } from '@shared/game/language';
import type { GlossaryTerm, Token } from '@shared/game/language';
import type { LanguageConfig } from '@rotp/game-data';
import { paramValuesFor } from './code-params';
import { BRACKETED, CODE_ORDER, SECTION_OF_CODE } from './insert-menu.constants';
import type { InsertChoice, InsertGroup, InsertOption, SectionId } from './insert-menu.type';

const isBreakRow = (name: string): name is '1' | '2' | '3' => (
  name === '1' || name === '2' || name === '3'
);

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

const glossaryOption = (glossary: GlossaryTerm[]): InsertOption => ({
  id: 'glossary-term',
  label: 'Glossary term',
  description: 'inserts one of this set\'s reusable phrases by name',
  needsChoice: true,
  choices: glossary.map((term) => ({ value: term.key, label: term.key, hint: term.value })),
  make: (choice) => ({ t: 'ref', key: choice ?? '' }),
});

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
