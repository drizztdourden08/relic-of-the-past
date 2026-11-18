/* @layer renderer-components @kind logic */
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import type { TabItem } from '@drizztdourden08/tessera/primitives';
import { OPTION_TAB_IDS } from '@app/hooks/randomizer/option-tab-model';
import type { ChangedCounts } from '@app/hooks/randomizer/option-tab-model';
import { optionTabLabels } from './option-tabs.constants';

const optionTabsOf = (counts: ChangedCounts, t: I18n['t']): TabItem[] => OPTION_TAB_IDS.map((id) => ({
  id,
  label: optionTabLabels(t)[id],
  badge: counts[id],
}));

export { optionTabsOf };
