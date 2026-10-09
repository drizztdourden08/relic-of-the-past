/* @layer renderer-components @kind component */
import { SettingsLayout } from '../../../compounds/SettingsLayout';
import { openVanillaSafeSettings } from '@app/stores/search-store';
import { DEFAULT_SETTINGS } from '@app/lib/game/settings';
import { SECTIONS } from './haptics-settings-sections.constants';
import { renderHapticsControl } from './haptics-settings-controls';
import { isHapticsSettingDisabled } from './haptics-settings-disabled';
import type { SettingsTabProps } from './settings-controls.type';

const HapticsSettings = (props: SettingsTabProps) => {
  const { settings, onChange } = props;
  return (
    <SettingsLayout
      sections={SECTIONS}
      settings={settings}
      defaults={DEFAULT_SETTINGS}
      onChange={onChange}
      renderControl={renderHapticsControl}
      isDisabled={isHapticsSettingDisabled}
      onOpenVanillaSafeSettings={openVanillaSafeSettings}
    />
  );
};

export { HapticsSettings };
