/* @layer renderer-components @kind component */
import { SettingsLayout } from '../../../compounds/SettingsLayout';
import { openVanillaSafeSettings } from '@app/stores/search-store';
import { DEFAULT_SETTINGS } from '@app/lib/game/settings';
import { SECTIONS } from './gameplay-settings-sections.constants';
import { renderControl } from './gameplay-settings-controls';
import { isGameplaySettingDisabled } from './gameplay-settings-disabled';
import type { SettingsTabProps } from './settings-controls.type';

const GameplaySettings = (props: SettingsTabProps) => {
  const { settings, onChange } = props;
  return (
    <SettingsLayout
      sections={SECTIONS}
      settings={settings}
      defaults={DEFAULT_SETTINGS}
      onChange={onChange}
      renderControl={renderControl}
      isDisabled={isGameplaySettingDisabled}
      onOpenVanillaSafeSettings={openVanillaSafeSettings}
    />
  );
};

export { GameplaySettings };
