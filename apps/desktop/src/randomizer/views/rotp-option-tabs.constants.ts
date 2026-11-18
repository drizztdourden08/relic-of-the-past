/* @layer renderer-app @kind constants */
import type { OptionTab } from '@drizztdourden08/brock-randomizer';
import { msg } from '@drizztdourden08/brock-core/i18n';
import { OPTION_TAB_IDS } from '@app/hooks/randomizer/option-tab-model';
import { ROTP_OPTION_TAB_BODIES } from './rotp-option-tab-bodies.constants';
import { ROTP_OPTION_TAB_KEYS } from './rotp-option-tab-keys.constants';

const ROTP_OPTION_TAB_LIST: readonly OptionTab[] = OPTION_TAB_IDS.map((id) => ({
  id,
  label: msg(`data-manager:option-tabs.${id}`),
  keys: ROTP_OPTION_TAB_KEYS[id],
  Body: ROTP_OPTION_TAB_BODIES[id],
}));

export { ROTP_OPTION_TAB_LIST };
