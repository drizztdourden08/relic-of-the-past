/* @layer renderer-components @kind logic */
/**
 * The tab strip of the options panel: the faces in the order they are
 * shown, each wearing the number of its rows that sit off the baseline. A tab
 * with nothing changed wears nothing, so the badge only ever means "there is
 * a setting in here you moved" — the answer to a screen too long to scroll
 * hiding a choice behind a tab the eye skipped.
 *
 * The order is the MODEL's, so a tab cannot exist in one and be missing from
 * the other; this file only names them.
 */
import { OPTION_TAB_IDS } from '@app/hooks/randomizer/option-tab-model';
import type { TabItem } from '@ds/primitives';
import type { ChangedCounts, OptionTabId } from '@app/hooks/randomizer/option-tab-model';

interface OptionTabDef {
  id: OptionTabId;
  label: string;
}

const OPTION_TAB_LABELS: Readonly<Record<OptionTabId, string>> = {
  world: 'World',
  goal: 'Goal',
  items: 'Items',
  shops: 'Shops',
  dungeon: 'Dungeon',
  capacity: 'Capacity upgrades',
  pond: 'Wishing pond',
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

const optionTabsOf = (counts: ChangedCounts): TabItem[] => OPTION_TABS.map(({ id, label }) => ({
  id,
  label,
  badge: counts[id] > 0 ? counts[id] : undefined,
}));

export { FIRST_OPTION_TAB, OPTION_TABS, optionTabsOf };
export type { OptionTabDef };
