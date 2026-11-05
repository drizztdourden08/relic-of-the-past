/* @layer renderer-app @kind constants */
import type { OptionTab } from '@drizztdourden08/brock-randomizer';
import { OPTION_TABS } from '@app/views/DataManager/sub-components/profile-manager/randomizer-options/option-tabs.constants';
import { ROTP_OPTION_TAB_BODIES } from './rotp-option-tab-bodies.constants';
import { ROTP_OPTION_TAB_KEYS } from './rotp-option-tab-keys.constants';

const ROTP_OPTION_TAB_LIST: readonly OptionTab[] = OPTION_TABS.map(({ id, label }) => ({
  id,
  label,
  keys: ROTP_OPTION_TAB_KEYS[id],
  Body: ROTP_OPTION_TAB_BODIES[id],
}));

export { ROTP_OPTION_TAB_LIST };
