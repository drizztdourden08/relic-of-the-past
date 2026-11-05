/* @layer renderer-app @kind logic */
import type { OptionTab } from '@drizztdourden08/brock-randomizer';
import { ROTP_OPTION_TAB_LIST } from './rotp-option-tabs.constants';

const optionTabs = (): readonly OptionTab[] => ROTP_OPTION_TAB_LIST;

export { optionTabs };
