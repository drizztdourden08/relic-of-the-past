/* @layer renderer-components @kind logic */
/**
 * Turns the existing grouped insert model into toolbar buttons.
 *
 * `buildInsertGroups` already does the deciding — it reads the control-code
 * catalog and the language's own alphabet, drops anything the catalog refuses to
 * offer or marks dangerous, and works out which values the encoder can actually
 * bake. This file adds presentation only: a symbol per row, and a numeral where
 * one symbol serves several rows. No second list of codes is introduced.
 *
 * A row's id carries which family it came from (`code-Wait`, `glyph-Up`,
 * `glossary-term`), which is how the symbol is chosen without re-deriving it.
 */
import { buildInsertGroups } from '../sub-components/insert-menu.model';
import { GLOSSARY_ICON, iconForCodeName } from './icon-for-token';
import type { GlossaryTerm } from '@shared/game/language';
import type { LanguageConfig } from '@shared/asset-extraction/text/data/language-data';
import type { InsertOption } from '../sub-components/insert-menu.types';
import type { ToolbarGroup, ToolbarItem } from './editor-ui.type';

const CODE_ID = /^code-(.+)$/;
const GLYPH_ID = /^glyph-(.+)$/;

/** The three line-start markers share a symbol; the row number separates them. */
const BADGE_FOR_CODE: Record<string, string> = { 1: '1', 2: '2', 3: '3' };

/**
 * A picture character is drawn as itself in the game face rather than as a
 * symbol, so it carries `glyph` and no icon. Its label is already the bracketed
 * alphabet entry the language spells it with.
 */
const glyphItem = (option: InsertOption): ToolbarItem => ({
  id: option.id,
  label: option.label,
  description: option.description,
  icon: null,
  glyph: option.label,
  needsChoice: option.needsChoice,
  choices: option.choices,
  make: option.make,
});

const symbolItem = (option: InsertOption, code: string | null): ToolbarItem => ({
  id: option.id,
  label: option.label,
  description: option.description,
  icon: code ? iconForCodeName(code) : GLOSSARY_ICON,
  badge: code ? BADGE_FOR_CODE[code] : undefined,
  needsChoice: option.needsChoice,
  choices: option.choices,
  make: option.make,
});

const toolbarItem = (option: InsertOption): ToolbarItem => (
  GLYPH_ID.test(option.id)
    ? glyphItem(option)
    : symbolItem(option, CODE_ID.exec(option.id)?.[1] ?? null)
);

/**
 * An empty cluster is dropped rather than shown empty: a set with no glossary
 * terms, or a base language whose alphabet carries no picture characters, should
 * not leave a heading with nothing under it.
 */
const buildToolbarGroups = (cfg: LanguageConfig, glossary: GlossaryTerm[]): ToolbarGroup[] => (
  buildInsertGroups(cfg, glossary)
    .map((group) => ({
      id: group.id,
      heading: group.heading,
      items: group.options
        .filter((option) => !option.needsChoice || option.choices.length > 0)
        .map(toolbarItem),
    }))
    .filter((group) => group.items.length > 0)
);

export { buildToolbarGroups };
