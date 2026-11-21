/* @layer renderer-appshell @kind logic */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { Text } from '@drizztdourden08/brock-core/i18n';
import type { WidgetDisabledState } from '@drizztdourden08/tessera/composites';
import type { GameSettings } from '@rotp/features';
import { DISABLED_SETTING_MESSAGES } from '@app/settings-controls/disabled-setting-messages.constants';
import { settingTarget } from './setting-target';
import type { WidgetGate } from './widget-gate.type';

const messageFor = (settingId: string): Text =>
  DISABLED_SETTING_MESSAGES[settingId] ?? msg('settings-controls:disabled.setting-off', { setting: settingId });

const resolveWidgetDisabledState = (gate: WidgetGate, settings: GameSettings, text: (value: Text) => string): WidgetDisabledState | null => {
  const disabledBy = (settingId: string): WidgetDisabledState => ({ message: text(messageFor(settingId)), settingId: settingTarget(settingId) });
  if (settings.vanillaSafe && gate.readsGameData) return disabledBy('vanillaSafe');
  if (gate.requiresSetting && !settings[gate.requiresSetting]) return disabledBy(gate.requiresSetting);
  return null;
};

export { resolveWidgetDisabledState };
