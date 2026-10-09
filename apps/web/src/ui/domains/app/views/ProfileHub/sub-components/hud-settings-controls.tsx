/* @layer renderer-components @kind logic */
import type { ReactNode } from 'react';
import type { GameSettings } from '@shared/types/settings';
import { SegmentedControl } from '../../../../../design-system/primitives/SegmentedControl';
import { ToggleGroup } from '../../../../../design-system/primitives/ToggleGroup';
import { HudStyleControl } from './HudStyleControl';
import { AspectRatioControl } from './AspectRatioControl';
import { renderDialogControl } from './hud-dialog-controls';
import { renderTitleControl } from './hud-title-controls';
import { hudRatioOptions } from './hud-ratio-options';
import { hostDrawnHud } from '@shared/features/hud-style';
import {
  COUNT_LAYOUT_OPTIONS, COUNTDOWN_STYLE_OPTIONS, ENHANCED_PARTS_OPTIONS, HEART_OPTIONS,
  HUD_MODE_OPTIONS, MAGIC_OPTIONS,
} from './hud-settings.constants';

const renderControl = (key: string, settings: GameSettings, onChange: (patch: Partial<GameSettings>) => void): ReactNode | null => {
  switch (key) {
    case 'hudMode':
      return (
        <SegmentedControl
          label="HUD Mode"
          description="Original renders directly on the game canvas. Enhanced draws a separate overlay with improved visuals and widescreen support."
          value={settings.hudMode}
          options={HUD_MODE_OPTIONS}
          onChange={(v) => onChange({ hudMode: v as GameSettings['hudMode'] })}
        />
      );
    case 'hudStyle':
      return (
        <HudStyleControl
          value={settings.hudStyle}
          settings={settings}
          onChange={(v) => onChange(hostDrawnHud(v)
            ? { hudStyle: v, hudMode: 'enhanced', hudEnhancedParts: ['main', 'pause'] }
            : { hudStyle: v })}
        />
      );
    case 'hudRatio':
      return (
        <AspectRatioControl
          label="Aspect Ratio"
          description="Match keeps the overlay in sync with the game viewport. Fixed ratios pin the HUD to a narrower area; Custom accepts any ratio."
          value={settings.hudRatio}
          options={hudRatioOptions(settings)}
          customW={settings.customHudAspectW}
          customH={settings.customHudAspectH}
          ratioKey="hudRatio"
          wKey="customHudAspectW"
          hKey="customHudAspectH"
          onChange={onChange}
        />
      );
    case 'hudEnhancedParts':
      return (
        <ToggleGroup
          label="Enhanced Parts"
          description="Select which parts the enhanced overlay replaces. Unselected parts keep using the original game rendering."
          value={settings.hudEnhancedParts as string[]}
          options={ENHANCED_PARTS_OPTIONS}
          onChange={(v) => onChange({ hudEnhancedParts: v as GameSettings['hudEnhancedParts'] })}
        />
      );
    case 'hudHeartMode':
      return (
        <SegmentedControl
          label="Heart Style"
          description="Original fills hearts in 4 steps like the SNES. Smooth fills them gradually for a more precise health readout."
          value={settings.hudHeartMode}
          options={HEART_OPTIONS}
          onChange={(v) => onChange({ hudHeartMode: v as GameSettings['hudHeartMode'] })}
        />
      );
    case 'hudMagicMode':
      return (
        <SegmentedControl
          label="Magic Meter"
          description="Original rounds the bar to 1/8ths. Accurate shows the true internal value for pixel-perfect depletion."
          value={settings.hudMagicMode}
          options={MAGIC_OPTIONS}
          onChange={(v) => onChange({ hudMagicMode: v as GameSettings['hudMagicMode'] })}
        />
      );
    case 'hudCountLayout':
      return (
        <SegmentedControl
          label="Counter Layout"
          description="Centered places counters in the middle of the HUD bar. Original matches the SNES left-aligned positions."
          value={settings.hudCountLayout}
          options={COUNT_LAYOUT_OPTIONS}
          onChange={(v) => onChange({ hudCountLayout: v as GameSettings['hudCountLayout'] })}
        />
      );
    case 'hudCountdownStyle':
      return (
        <SegmentedControl
          label="Countdown Timer"
          value={settings.hudCountdownStyle}
          options={COUNTDOWN_STYLE_OPTIONS}
          onChange={(v) => onChange({ hudCountdownStyle: v as GameSettings['hudCountdownStyle'] })}
        />
      );
    default:
      return renderTitleControl(key, settings, onChange) ?? renderDialogControl(key, settings, onChange);
  }
};

export { renderControl };
