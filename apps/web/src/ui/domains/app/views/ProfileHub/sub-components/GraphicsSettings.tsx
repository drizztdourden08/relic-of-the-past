/* @layer renderer-components @kind component */
import { type ReactNode } from 'react';
import type { GameSettings } from '@shared/types/settings';
import { SettingsLayout } from '../../../compounds/SettingsLayout';
import { openVanillaSafeSettings } from '@app/stores/search-store';
import { DEFAULT_SETTINGS } from '@app/lib/game/settings';
import { GRAPHICS_SECTIONS } from './graphics-settings-sections.constants';
import { isGraphicsSettingDisabled } from './graphics-settings-disabled';
import { PlayerSpriteSelector } from './PlayerSpriteSelector';
import type { SettingsTabProps } from './settings-controls.type';

const renderControl = (key: string, settings: GameSettings, onChange: (patch: Partial<GameSettings>) => void): ReactNode | null => {
  if (key !== 'linkSprite') return null;
  return <PlayerSpriteSelector value={settings.linkSprite} onChange={(v) => onChange({ linkSprite: v })} />;
};

const GraphicsSettings = (props: SettingsTabProps) => {
  const { settings, onChange } = props;
  return (
    <SettingsLayout
      sections={GRAPHICS_SECTIONS}
      settings={settings}
      defaults={DEFAULT_SETTINGS}
      onChange={onChange}
      renderControl={renderControl}
      isDisabled={isGraphicsSettingDisabled}
      onOpenVanillaSafeSettings={openVanillaSafeSettings}
    />
  );
};

export { GraphicsSettings };
