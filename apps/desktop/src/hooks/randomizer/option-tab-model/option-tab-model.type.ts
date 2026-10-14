/* @layer renderer-hooks @kind types */
import type { OptionDef } from '@rotp/randomizer';
import type { LockedOptionGroup } from '@app/compounds/RandomizerOptionRow';
import type { LIST_TABS, LOCKED_TABS, OPTION_TAB_IDS } from './option-tab-model.constants';

type OptionTabId = (typeof OPTION_TAB_IDS)[number];

type ListTabId = (typeof LIST_TABS)[number];

type LockedTabId = (typeof LOCKED_TABS)[number];

type UnlockedGroupsByTab = Readonly<Record<ListTabId, LockedOptionGroup[]>>;

type LockedGroupsByTab = Readonly<Record<LockedTabId, LockedOptionGroup[]>>;

type ChangedCounts = Readonly<Record<OptionTabId, number>>;

type OptionTabRule = { tab: OptionTabId; matches: (option: OptionDef) => boolean };

export type { ChangedCounts, ListTabId, LockedGroupsByTab, LockedTabId, OptionTabId, OptionTabRule, UnlockedGroupsByTab };
