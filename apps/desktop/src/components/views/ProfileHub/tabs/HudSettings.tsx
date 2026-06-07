/* @layer renderer-components @kind component */
import type { GameSettings } from '@shared/types/settings';
import { SettingsLayout } from '../../../composites/SettingsLayout';
import { SECTIONS } from './hud-settings-sections';
import { renderControl } from './hud-settings-controls';

interface HudSettingsProps {
  settings: GameSettings;
  onChange: (patch: Partial<GameSettings>) => void;
}

const HudSettings = ({ settings, onChange }: HudSettingsProps) => {
  return (
    <SettingsLayout
      sections={SECTIONS}
      settings={settings}
      onChange={onChange}
      renderControl={renderControl}
    />
  );
};

export { HudSettings };
