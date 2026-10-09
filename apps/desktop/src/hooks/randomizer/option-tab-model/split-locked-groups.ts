/* @layer renderer-hooks @kind logic */
import type { LockedOptionGroup } from '@domains/app/compounds/RandomizerOptionRow';
import type { OptionDef } from '@shared/randomizer/world/options.type';
import { LOCKED_TABS } from './option-tab-model.constants';
import type { LockedGroupsByTab, LockedTabId, OptionTabId } from './option-tab-model.type';
import { tabOfOption } from './tab-of-option';
import { emptyGroups } from './empty-groups';

const lockedTabOfOption = (option: OptionDef): LockedTabId => {
  const tab = tabOfOption(option);
  return (LOCKED_TABS as readonly OptionTabId[]).includes(tab) ? tab as LockedTabId : 'world';
};

const splitLockedGroups = (groups: readonly LockedOptionGroup[]): LockedGroupsByTab => {
  const byTab = emptyGroups(LOCKED_TABS);
  for (const { group, options } of groups) {
    for (const tab of LOCKED_TABS) {
      const rows = options.filter((option) => lockedTabOfOption(option) === tab);
      if (rows.length > 0) byTab[tab].push({ group, options: rows });
    }
  }
  return byTab;
};

export { splitLockedGroups };
