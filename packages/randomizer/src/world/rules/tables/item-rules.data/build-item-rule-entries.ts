/* @layer shared-game @kind logic */
import { ITEM } from '../../../item-ids.data';
import { PRIZE_LOCATIONS } from '../../../scope-tables';
import { DEFAULT_DUNGEON_ITEM_SETTING, staysInOwnDungeon } from '../../../dungeon-items/dungeon-item-modes';
import { PRIZE_SET } from './item-rules.constants';
import type { World } from '../../../world.type';
import type { ItemRuleEntry } from '../../rule-entry.type';

const buildItemRuleEntries = (world: World): ItemRuleEntry[] => {
  const entries: ItemRuleEntry[] = [...PRIZE_LOCATIONS].map((location): ItemRuleEntry => ({
    location,
    allowed: (item) => PRIZE_SET.has(item),
  }));
  const smallKeys = (world.options.dungeonItems ?? DEFAULT_DUNGEON_ITEM_SETTING).smallKey;
  if (staysInOwnDungeon(smallKeys)) {
    entries.push({
      location: 'check-157', allowed: (item) => item !== ITEM.bigKeySwampPalace,
    });
  }
  return entries;
};

export { buildItemRuleEntries };
