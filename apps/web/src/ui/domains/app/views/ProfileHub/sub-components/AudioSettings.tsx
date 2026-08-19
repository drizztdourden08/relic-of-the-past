/* @layer renderer-components @kind component */
import type { GameSettings } from '@shared/types/settings';
import { SettingsLayout } from '../../../compounds/SettingsLayout';
import { openVanillaSafeSettings } from '@app/stores/search-store';
import { SECTIONS } from './audio-settings-sections';
import { renderControl, isDisabled } from './audio-settings-controls';

interface AudioSettingsProps {
  settings: GameSettings;
  onChange: (patch: Partial<GameSettings>) => void;
}

const AudioSettings = (props: AudioSettingsProps) => {
  const { settings, onChange } = props;
  return (
    <SettingsLayout
      sections={SECTIONS}
      settings={settings}
      onChange={onChange}
      renderControl={renderControl}
      isDisabled={isDisabled}
      onOpenVanillaSafeSettings={openVanillaSafeSettings}
    />
  );
};

export { AudioSettings };
