/* @layer renderer-components @kind component */
import type { GameSettings } from '@shared/types/settings';
import { SettingsLayout } from '../../../compounds/SettingsLayout';
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
    />
  );
};

export { DeveloperSettings };
