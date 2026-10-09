/* @layer renderer-hooks @kind logic */
import type { LockedOptionGroup } from '@domains/app/compounds/RandomizerOptionRow';
import type { OptionDef } from '@rotp/randomizer';
import { LIST_TABS } from './option-tab-model.constants';
import type { ListTabId, OptionTabId, UnlockedGroupsByTab } from './option-tab-model.type';
import { tabOfOption } from './tab-of-option';
import { emptyGroups } from './empty-groups';

const listTabOfOption = (option: OptionDef): ListTabId => {
  const tab = tabOfOption(option);
  return (LIST_TABS as readonly OptionTabId[]).includes(tab) ? tab as ListTabId : 'world';
};

const splitUnlockedGroups = (groups: readonly LockedOptionGroup[]): UnlockedGroupsByTab => {
  const byTab = emptyGroups(LIST_TABS);
  for (const { group, options } of groups) {
    for (const tab of LIST_TABS) {
      const rows = options.filter((option) => listTabOfOption(option) === tab);
      if (rows.length > 0) byTab[tab].push({ group, options: rows });
    }
  }
  return byTab;
};

export { splitUnlockedGroups };
