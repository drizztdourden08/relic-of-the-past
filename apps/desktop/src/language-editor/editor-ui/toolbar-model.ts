/* @layer renderer-components @kind logic */
import { buildInsertGroups } from '../sub-components/insert-menu-model';
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import { isMergedSecond, mergedSecondOf } from '../editor/merged-glyph';
import type { LanguageConfig } from '@rotp/asset-extraction';
import type { InsertOption } from '../sub-components/insert-menu.type';
import type { ToolbarItem } from './editor-ui.type';
import { GLYPH_GROUP } from './toolbar-model.constants';

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

const pairedWith = (t: I18n['t'], item: ToolbarItem, tail: ToolbarItem): ToolbarItem => ({
  ...item,
  description: t('language-editor:insert.glyph.paired', { description: item.description }),
  make: (choice) => [...item.make(choice), ...tail.make(choice)],
});

const mergePairedGlyphs = (t: I18n['t'], items: ToolbarItem[]): ToolbarItem[] => {
  const byGlyph = new Map(items.map((item) => [bareGlyph(item), item]));

  return items
    .filter((item) => !isMergedSecond(bareGlyph(item)))
    .map((item) => {
      const second = mergedSecondOf(bareGlyph(item));
      const tail = second === null ? undefined : byGlyph.get(second);
      return tail === undefined ? item : pairedWith(t, item, tail);
    });
};

const buildGlyphItems = (t: I18n['t'], cfg: LanguageConfig): ToolbarItem[] => {
  const group = buildInsertGroups(t, cfg, []).find((entry) => entry.id === GLYPH_GROUP);
  return group === undefined ? [] : mergePairedGlyphs(t, group.options.map(glyphItem));
};

export { buildGlyphItems };
