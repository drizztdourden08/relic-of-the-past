/* @layer renderer-components @kind logic */
import { buildInsertGroups } from '../sub-components/insert-menu.model';
import { isMergedSecond, mergedSecondOf } from '../editor/merged-glyph';
import type { LanguageConfig } from '@rotp/game-data';
import type { InsertOption } from '../sub-components/insert-menu.type';
import type { ToolbarItem } from './editor-ui.type';
import { GLYPH_GROUP } from './toolbar.model.constants';

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

const bareGlyph = (item: ToolbarItem): string => (item.glyph ?? '').replace(/^\[|\]$/g, '');

const pairedWith = (item: ToolbarItem, tail: ToolbarItem): ToolbarItem => ({
  ...item,
  description: `${item.description}, spelled as a pair of entries and inserted as one`,
  make: (choice) => [...item.make(choice), ...tail.make(choice)],
});

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

const buildGlyphItems = (cfg: LanguageConfig): ToolbarItem[] => {
  const group = buildInsertGroups(cfg, []).find((entry) => entry.id === GLYPH_GROUP);
  return group === undefined ? [] : mergePairedGlyphs(group.options.map(glyphItem));
};

export { buildGlyphItems };
