/* @layer renderer-components @kind constants */
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import { OPTION_TAB_IDS } from '@app/hooks/randomizer/option-tab-model';
import type { OptionTabId } from '@app/hooks/randomizer/option-tab-model';

const optionTabLabels = (t: I18n['t']): Readonly<Record<OptionTabId, string>> => ({
  world: t('data-manager:option-tabs.world'),
  goal: t('data-manager:option-tabs.goal'),
  items: t('data-manager:option-tabs.items'),
  shops: t('data-manager:option-tabs.shops'),
  dungeon: t('data-manager:option-tabs.dungeon'),
  capacity: t('data-manager:option-tabs.capacity'),
  pond: t('data-manager:option-tabs.pond'),
  environmental: t('data-manager:option-tabs.environmental'),
  entrance: t('data-manager:option-tabs.entrance'),
  enemies: t('data-manager:option-tabs.enemies'),
  traps: t('data-manager:option-tabs.traps'),
  minigames: t('data-manager:option-tabs.minigames'),
  timer: t('data-manager:option-tabs.timer'),
  glitches: t('data-manager:option-tabs.glitches'),
});

const FIRST_OPTION_TAB: OptionTabId = OPTION_TAB_IDS[0];

export { FIRST_OPTION_TAB, optionTabLabels };
