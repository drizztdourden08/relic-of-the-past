/* @layer renderer-appshell @kind logic */
import type { WidgetDisabledState } from '@drizztdourden08/tessera/composites';
import type { GameSettings } from '@rotp/features';
import { DISABLED_SETTING_MESSAGES } from '@app/settings-controls/disabled-setting-messages.constants';
import { settingTarget } from './setting-target';
import type { WidgetGate } from './widget-gate.type';

const messageFor = (settingId: string): string =>
  DISABLED_SETTING_MESSAGES[settingId] ?? `Disabled: ${settingId} is off`;

const disabledBy = (settingId: string): WidgetDisabledState => ({ message: messageFor(settingId), settingId: settingTarget(settingId) });

const resolveWidgetDisabledState = (gate: WidgetGate, settings: GameSettings): WidgetDisabledState | null => {
  if (settings.vanillaSafe && gate.readsGameData) return disabledBy('vanillaSafe');
  if (gate.requiresSetting && !settings[gate.requiresSetting]) return disabledBy(gate.requiresSetting);
  return null;
};

export { resolveWidgetDisabledState };
