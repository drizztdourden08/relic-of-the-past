/* @layer renderer-components @kind logic */
import { FROZEN_POND_KEYS, NO_FROZEN_KEYS, pondGroupsFor } from '@app/hooks/randomizer/pond-mode-rows';
import { forcedItemPowerRows } from '@app/hooks/randomizer/item-power-rows';
import type { UnlockedGroupsByTab } from '@app/hooks/randomizer/option-tab-model';
import type { OptionDef, OptionValue } from '@rotp/randomizer';
import type { ListView, OptionTabContext } from './OptionTabBody.type';

const pondFrozenKeys = (editable: boolean) => (editable ? NO_FROZEN_KEYS : FROZEN_POND_KEYS);

const listViewOf = (
  tab: keyof UnlockedGroupsByTab,
  context: OptionTabContext,
  groups: UnlockedGroupsByTab,
  valueOf: (option: OptionDef) => OptionValue,
): ListView => {
  const { choices, rule } = context;
  if (tab === 'items') {
    const forced = forcedItemPowerRows(choices.progressiveTiers, valueOf);
    return { groups: groups.items, valueOf: forced.valueOf, frozenKeys: forced.keys, notes: forced.notes };
  }
  const listGroups = tab === 'pond' ? pondGroupsFor(groups.pond, rule.pondModes) : groups[tab];
  return { groups: listGroups, valueOf, frozenKeys: pondFrozenKeys(rule.pondEditable), notes: undefined };
};

export { listViewOf };
