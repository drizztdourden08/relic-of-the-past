/* @layer renderer-components @kind constants */
import type { TabItem } from '@drizztdourden08/tessera/primitives';

const OVERVIEW_TAB = 'overview';
const SETTINGS_TAB = 'settings';
const DATA_TAB = 'data';
const RANDOMIZER_TAB = 'randomizer';

const BASE_TABS: TabItem[] = [
  { id: OVERVIEW_TAB, label: 'Overview' },
  { id: SETTINGS_TAB, label: 'Settings' },
  { id: DATA_TAB, label: 'Saves and play' },
];

const RANDOMIZER_TAB_ITEM: TabItem = { id: RANDOMIZER_TAB, label: 'Randomizer' };

export { BASE_TABS, DATA_TAB, OVERVIEW_TAB, RANDOMIZER_TAB, RANDOMIZER_TAB_ITEM, SETTINGS_TAB };
