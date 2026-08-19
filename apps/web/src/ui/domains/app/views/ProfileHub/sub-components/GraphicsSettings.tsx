/* @layer renderer-components @kind component */
/** Graphics tab — how the picture is drawn: renderer, quality, post-processing effects, and player appearance. */
import { type ReactNode } from 'react';
import type { GameSettings } from '@shared/types/settings';
import { SettingsLayout, type Section } from '../../../compounds/SettingsLayout';
import { openVanillaSafeSettings } from '@app/stores/search-store';
import { RENDERING_SECTION, ENHANCEMENTS_SECTION } from './SettingsView.constants';
import { APPEARANCE_SECTION } from './graphics-settings-sections';
import { PlayerSpriteSelector } from './PlayerSpriteSelector';

interface GraphicsSettingsProps {
  settings: GameSettings;
  onChange: (patch: Partial<GameSettings>) => void;
}

const SECTIONS: Section[] = [RENDERING_SECTION, ENHANCEMENTS_SECTION, APPEARANCE_SECTION];

// Pixel Perfect promises whole, identical source pixels — bilinear interpolation would break that
// upstream of everything else, so the core is handed LinearFiltering off and the control follows suit.
//
// enhancedMode7 and noSpriteLimits aren't registered FeatureDefs yet, so the DisabledOverlay lock
// (driven by feature-registry.ts) can't reach them the way it does for e.g. extendedRendering — lock them
// by hand here instead, matching how buildPpuFlags forces both off under Vanilla Safe. newRenderer is
// deliberately left enabled: its own description ("visually identical but significantly faster") makes it
// a pure engine swap, not a divergence from stock rendering.
const isDisabled = (key: string, settings: GameSettings): boolean => {
  if (key === 'linearFiltering') return settings.pixelPerfect;
  if (key === 'enhancedMode7' || key === 'noSpriteLimits') return !!settings.vanillaSafe;
  return false;
};

const renderControl = (key: string, settings: GameSettings, onChange: (patch: Partial<GameSettings>) => void): ReactNode | null => {
  if (key !== 'linkSprite') return null;
  return <PlayerSpriteSelector value={settings.linkSprite} onChange={(v) => onChange({ linkSprite: v })} />;
};

const GraphicsSettings = (props: GraphicsSettingsProps) => {
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

export { GraphicsSettings };
