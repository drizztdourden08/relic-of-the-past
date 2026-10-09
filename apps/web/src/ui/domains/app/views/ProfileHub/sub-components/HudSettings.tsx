/* @layer renderer-components @kind component */
import { SettingsLayout } from '../../../compounds/SettingsLayout';
import { openVanillaSafeSettings } from '@app/stores/search-store';
import { DEFAULT_SETTINGS } from '@app/lib/game/settings';
import { SECTIONS } from './hud-settings-sections.constants';
import { renderControl } from './hud-settings-controls';
import { isHudSettingDisabled } from './hud-settings-disabled';
import type { SettingsTabProps } from './settings-controls.type';

const HudSettings = ({ settings, onChange }: SettingsTabProps) => {
  return (
    <SettingsLayout
      sections={SECTIONS}
      settings={settings}
      defaults={DEFAULT_SETTINGS}
      onChange={onChange}
      renderControl={renderControl}
      isDisabled={isHudSettingDisabled}
      onOpenVanillaSafeSettings={openVanillaSafeSettings}
    />
  );
};

export { HudSettings };
