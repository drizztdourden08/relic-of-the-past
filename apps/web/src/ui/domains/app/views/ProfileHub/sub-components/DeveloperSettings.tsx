/* @layer renderer-components @kind component */
import { SettingsLayout } from '../../../compounds/SettingsLayout';
import { openVanillaSafeSettings } from '@app/stores/search-store';
import { DEFAULT_SETTINGS } from '@app/lib/game/settings';
import { SECTIONS, SANCTUARY_ACCOUNT_KEY } from './developer-settings-sections.constants';
import { SanctuaryAccount } from './SanctuaryAccount';
import type { SettingsTabProps } from './settings-controls.type';

const renderControl = (key: string) => (key === SANCTUARY_ACCOUNT_KEY ? <SanctuaryAccount /> : null);

const DeveloperSettings = (props: SettingsTabProps) => {
  const { settings, onChange } = props;
  return (
    <SettingsLayout
      sections={SECTIONS}
      renderControl={renderControl}
      settings={settings}
      defaults={DEFAULT_SETTINGS}
      onChange={onChange}
      onOpenVanillaSafeSettings={openVanillaSafeSettings}
    />
  );
};

export { DeveloperSettings };
