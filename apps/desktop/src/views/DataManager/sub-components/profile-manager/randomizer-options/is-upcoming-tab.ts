/* @layer renderer-components @kind logic */
import { UPCOMING_TABS } from './option-tab-copy.constants';
import type { OptionTabId } from '@app/hooks/randomizer/option-tab-model';
import type { UpcomingTabId } from './option-tab-copy.type';

const isUpcomingTab = (tab: OptionTabId): tab is UpcomingTabId => UPCOMING_TABS.has(tab);

export { isUpcomingTab };
