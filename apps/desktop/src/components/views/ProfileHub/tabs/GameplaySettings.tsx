/* @layer renderer-components @kind component */
import type { GameSettings } from '@shared/types/settings';
import { SettingsLayout } from '../../../composites/SettingsLayout';
import { SECTIONS } from './gameplay-settings-sections';
import { renderControl, isDisabled } from './gameplay-settings-controls';

interface GameplaySettingsProps {
  settings: GameSettings;
  onChange: (patch: Partial<GameSettings>) => void;
}

const GameplaySettings = (props: GameplaySettingsProps) => {
  const { settings, onChange } = props;
  return (
    <SettingsLayout
      sections={SECTIONS}
      settings={settings}
      onChange={onChange}
      renderControl={renderControl}
      isDisabled={isDisabled}
    />
  );
};

export { GameplaySettings };
