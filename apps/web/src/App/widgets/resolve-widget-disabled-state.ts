/* @layer renderer-appshell @kind logic */
import type { WidgetDisabledState } from '@drizztdourden08/tessera/composites';
import type { GameSettings } from '@shared/types/settings';
import { DISABLED_SETTING_MESSAGES } from '@domains/app/disabled-setting-messages.constants';
import type { RotpWidgetDefinition } from './rotp-widget-definition.type';

const messageFor = (settingId: string): string =>
  DISABLED_SETTING_MESSAGES[settingId] ?? `Disabled: ${settingId} is off`;

const resolveWidgetDisabledState = (
  def: RotpWidgetDefinition,
  vanillaSafe: boolean,
  settings: GameSettings | null | undefined,
): WidgetDisabledState | null => {
  if (vanillaSafe && def.readsGameData) return { message: messageFor('vanillaSafe'), settingId: 'vanillaSafe' };
  if (def.requiresSetting && settings && !settings[def.requiresSetting]) {
    return { message: messageFor(def.requiresSetting), settingId: def.requiresSetting };
  }
  return null;
};

export { resolveWidgetDisabledState };
