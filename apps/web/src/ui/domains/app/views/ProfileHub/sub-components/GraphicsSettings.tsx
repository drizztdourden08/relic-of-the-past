/* @layer renderer-components @kind component */
/** Graphics tab — how the picture is drawn: renderer, quality, post-processing effects, and player appearance. */
import { type ReactNode } from 'react';
import type { GameSettings } from '@shared/types/settings';
import { SettingsLayout, type Section } from '../../../compounds/SettingsLayout';
import { RENDERING_SECTION, ENHANCEMENTS_SECTION } from './SettingsView.constants';
import { PlayerSpriteSelector } from './PlayerSpriteSelector';

interface GraphicsSettingsProps {
  settings: GameSettings;
  onChange: (patch: Partial<GameSettings>) => void;
}

const APPEARANCE_SECTION: Section = {
  id: 'appearance',
  title: 'Appearance',
  subsections: [
    {
      id: 'appearance-player',
      title: 'Player Sprite',
      items: [{ key: 'linkSprite', label: 'Player Sprite', description: 'Choose a custom player sprite from your library.', keywords: 'player sprite character appearance custom zspr' }],
    },
  ],
};

const SECTIONS: Section[] = [RENDERING_SECTION, ENHANCEMENTS_SECTION, APPEARANCE_SECTION];

const renderControl = (key: string, settings: GameSettings, onChange: (patch: Partial<GameSettings>) => void): ReactNode | null => {
  if (key !== 'linkSprite') return null;
  return <PlayerSpriteSelector value={settings.linkSprite} onChange={(v) => onChange({ linkSprite: v })} />;
};

const GraphicsSettings = (props: GraphicsSettingsProps) => {
  const { settings, onChange } = props;
  return <SettingsLayout sections={SECTIONS} settings={settings} onChange={onChange} renderControl={renderControl} />;
};

export { GraphicsSettings };
