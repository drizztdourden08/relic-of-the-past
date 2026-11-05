/* @layer renderer-app @kind constants */
import { optionCatalog } from '@rotp/randomizer';
import { OPTION_TAB_IDS } from '@app/hooks/randomizer/option-tab-model';
import type { OptionTabId } from '@app/hooks/randomizer/option-tab-model';
import { tabOfOption } from '@app/hooks/randomizer/option-tab-model/tab-of-option';

const keysOfTab = (tab: OptionTabId): readonly string[] =>
  optionCatalog.filter((option) => tabOfOption(option) === tab).map((option) => option.key);

const ROTP_OPTION_TAB_KEYS: Readonly<Record<OptionTabId, readonly string[]>> =
  Object.fromEntries(OPTION_TAB_IDS.map((tab) => [tab, keysOfTab(tab)])) as Record<OptionTabId, readonly string[]>;

export { ROTP_OPTION_TAB_KEYS };
