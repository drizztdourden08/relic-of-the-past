/* @layer shared-game @kind logic */
import { DEFAULT_PROGRESSIVE_SETTING } from '../../../progressive/progressive-families.constants';
import { DEFAULT_DIFFICULTY } from '../../../difficulty/difficulty';
import { DEFAULT_PROGRESSIVE_MODES } from '../../../progressive/progressive-modes';
import { DEFAULT_RETRO_BOW } from '../../../retro/retro-bow.constants';
import { DEFAULT_ITEM_POWER } from '../../../item-power/item-power.constants';
import { DEFAULT_ACCESSIBILITY } from '../../../accessibility/accessibility-from-snapshot';
import { DEFAULT_DUNGEON_ITEM_SETTING } from '../../../dungeon-items/dungeon-item-modes';
import type { FillWorldOptions } from '../../fill-world.type';
import type { ItemDefaults } from './fill-defaults.type';

const itemDefaultsOf = (options: FillWorldOptions): ItemDefaults => {
  const {
    progressiveTiers = DEFAULT_PROGRESSIVE_SETTING, progressiveModes = DEFAULT_PROGRESSIVE_MODES,
    itemPower = DEFAULT_ITEM_POWER, retroBow = DEFAULT_RETRO_BOW,
    dungeonItems = DEFAULT_DUNGEON_ITEM_SETTING, accessibility = DEFAULT_ACCESSIBILITY,
    difficulty = DEFAULT_DIFFICULTY,
  } = options;
  return { progressiveTiers, progressiveModes, itemPower, retroBow, dungeonItems, accessibility, difficulty };
};

export { itemDefaultsOf };
