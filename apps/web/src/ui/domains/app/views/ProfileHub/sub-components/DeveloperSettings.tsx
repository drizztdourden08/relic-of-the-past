/* @layer renderer-components @kind component */
import type { GameSettings } from '@shared/types/settings';
import { SettingsLayout } from '../../../compounds/SettingsLayout';
import { openVanillaSafeSettings } from '@app/stores/search-store';
import { SECTIONS } from './developer-settings-sections';

interface DeveloperSettingsProps {
  settings: GameSettings;
  onChange: (patch: Partial<GameSettings>) => void;
}

const DeveloperSettings = (props: DeveloperSettingsProps) => {
  const { settings, onChange } = props;
  return (
    <SettingsLayout
      sections={SECTIONS}
      settings={settings}
      onChange={onChange}
      onOpenVanillaSafeSettings={openVanillaSafeSettings}
    />
  );
};

export { DeveloperSettings };
