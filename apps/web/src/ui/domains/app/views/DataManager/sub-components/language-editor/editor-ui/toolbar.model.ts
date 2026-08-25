/* @layer renderer-components @kind logic */
/**
 * The alphabet's picture characters, as the glyph popover offers them.
 *
 * Which bracket names are characters rather than control codes is settled by
 * `buildInsertGroups`, which reads the language's own alphabet and the
 * control-code catalog. This file takes that answer's character cluster and
 * presents it; no second list of names is introduced here.
 *
 * A picture the alphabet spells as TWO adjacent entries is one character to an
 * author, so the pair becomes ONE item: the opening half draws the whole picture
 * and inserts both entries' tokens in order. Half a picture is something the
 * encoder will happily bake and a player will read as nonsense.
 */
import { buildInsertGroups } from '../sub-components/insert-menu.model';
import { isMergedSecond, mergedSecondOf } from '../editor/merged-glyph';
import type { LanguageConfig } from '@shared/asset-extraction/text/data/language-data';
import type { InsertOption } from '../sub-components/insert-menu.types';
import type { ToolbarItem } from './editor-ui.type';

/** The cluster `buildInsertGroups` files the alphabet's own characters under. */
const GLYPH_GROUP = 'icons';

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
  make: (choice) => [option.make(choice)],
});

/** `[1HeartL]` as the alphabet stores it, `1HeartL` as a token carries it. */
const bareGlyph = (item: ToolbarItem): string => (item.glyph ?? '').replace(/^\[|\]$/g, '');

/** The pair, as one item: the whole picture drawn, and both entries inserted. */
const pairedWith = (item: ToolbarItem, tail: ToolbarItem): ToolbarItem => ({
  ...item,
  description: `${item.description}, spelled as a pair of entries and inserted as one`,
  make: (choice) => [...item.make(choice), ...tail.make(choice)],
});

/**
 * The closing half of a two-entry picture gets no item of its own; the opening
 * half's item calls that half's own maker straight after its own, so the token
 * pair is built by the alphabet's makers rather than assembled here.
 */
const mergePairedGlyphs = (items: ToolbarItem[]): ToolbarItem[] => {
  const byGlyph = new Map(items.map((item) => [bareGlyph(item), item]));

  return items
    .filter((item) => !isMergedSecond(bareGlyph(item)))
    .map((item) => {
      const second = mergedSecondOf(bareGlyph(item));
      const tail = second === null ? undefined : byGlyph.get(second);
      return tail === undefined ? item : pairedWith(item, tail);
    });
};

/**
 * The characters this language actually carries, as whole pictures. An alphabet
 * with none of them returns an empty list, and the button that would open the
 * popover is disabled rather than opening on nothing.
 */
const buildGlyphItems = (cfg: LanguageConfig): ToolbarItem[] => {
  const group = buildInsertGroups(cfg, []).find((entry) => entry.id === GLYPH_GROUP);
  return group === undefined ? [] : mergePairedGlyphs(group.options.map(glyphItem));
};

export { buildGlyphItems };
