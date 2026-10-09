/* @layer renderer-components @kind logic */
import { OPTION_TABS } from './option-tabs.constants';
import type { TabItem } from '@drizztdourden08/tessera/primitives';
import type { ChangedCounts } from '@app/hooks/randomizer/option-tab-model';

const optionTabsOf = (counts: ChangedCounts): TabItem[] => OPTION_TABS.map(({ id, label }) => ({
  id,
  label,
  badge: counts[id] > 0 ? counts[id] : undefined,
}));

export { optionTabsOf };
