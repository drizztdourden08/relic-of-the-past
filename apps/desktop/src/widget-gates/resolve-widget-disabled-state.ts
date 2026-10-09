/* @layer renderer-appshell @kind logic */
import type { GameSettings } from '@shared/types/settings';
import { DISABLED_SETTING_MESSAGES } from '@domains/app/disabled-setting-messages.constants';
import type { WidgetDisabledState, WidgetGate } from './widget-gate.type';

const messageFor = (settingId: string): string =>
  DISABLED_SETTING_MESSAGES[settingId] ?? `Disabled: ${settingId} is off`;

const resolveWidgetDisabledState = (gate: WidgetGate, settings: GameSettings): WidgetDisabledState | null => {
  if (settings.vanillaSafe && gate.readsGameData) return { message: messageFor('vanillaSafe'), settingId: 'vanillaSafe' };
  if (gate.requiresSetting && !settings[gate.requiresSetting]) {
    return { message: messageFor(gate.requiresSetting), settingId: gate.requiresSetting };
  }
  return null;
};

export { resolveWidgetDisabledState };
