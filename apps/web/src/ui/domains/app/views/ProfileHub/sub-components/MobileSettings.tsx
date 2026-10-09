/* @layer renderer-components @kind component */
import { SettingsLayout } from '../../../compounds/SettingsLayout';
import { openVanillaSafeSettings } from '@app/stores/search-store';
import { DEFAULT_SETTINGS } from '@app/lib/game/settings';
import { MOBILE_SECTIONS } from './SettingsView.constants';
import type { SettingsTabProps } from './settings-controls.type';

const MobileSettings = (props: SettingsTabProps) => {
  const { settings, onChange } = props;
  return (
    <SettingsLayout
      sections={MOBILE_SECTIONS}
      settings={settings}
      defaults={DEFAULT_SETTINGS}
      onChange={onChange}
      onOpenVanillaSafeSettings={openVanillaSafeSettings}
    />
  );
};

export { MobileSettings };
