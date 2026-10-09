/* @layer renderer-components @kind constants */
import { OPTION_TAB_IDS } from '@app/hooks/randomizer/option-tab-model';
import type { OptionTabId } from '@app/hooks/randomizer/option-tab-model';
import type { OptionTabDef } from './option-tabs.type';

const OPTION_TAB_LABELS: Readonly<Record<OptionTabId, string>> = {
  world: 'World',
  goal: 'Goal',
  items: 'Items',
  shops: 'Shops',
  dungeon: 'Dungeon',
  capacity: 'Capacity upgrades',
  pond: 'Fairy ponds',
  environmental: 'Environmental',
  entrance: 'Entrance',
  enemies: 'Enemies',
  traps: 'Traps',
  minigames: 'Mini-games',
  timer: 'Timer',
  glitches: 'Glitches',
};

const OPTION_TABS: readonly OptionTabDef[] =
  OPTION_TAB_IDS.map((id) => ({ id, label: OPTION_TAB_LABELS[id] }));

const FIRST_OPTION_TAB: OptionTabId = OPTION_TABS[0].id;

export { OPTION_TAB_LABELS, OPTION_TABS, FIRST_OPTION_TAB };
