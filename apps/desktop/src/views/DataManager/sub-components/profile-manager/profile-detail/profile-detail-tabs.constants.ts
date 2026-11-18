/* @layer renderer-components @kind constants */
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import type { TabItem } from '@drizztdourden08/tessera/primitives';

const OVERVIEW_TAB = 'overview';
const SETTINGS_TAB = 'settings';
const DATA_TAB = 'data';
const RANDOMIZER_TAB = 'randomizer';

const baseTabs = (t: I18n['t']): TabItem[] => [
  { id: OVERVIEW_TAB, label: t('data-manager:profile-detail.tabs.overview') },
  { id: SETTINGS_TAB, label: t('data-manager:profile-detail.tabs.settings') },
  { id: DATA_TAB, label: t('data-manager:profile-detail.tabs.data') },
];

const randomizerTabItem = (t: I18n['t']): TabItem => ({ id: RANDOMIZER_TAB, label: t('data-manager:profile-detail.tabs.randomizer') });

export { baseTabs, DATA_TAB, OVERVIEW_TAB, RANDOMIZER_TAB, randomizerTabItem, SETTINGS_TAB };
