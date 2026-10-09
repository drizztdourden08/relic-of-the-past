/* @layer renderer-components @kind logic */
import type { ReactNode } from 'react';
import type { GameSettings } from '@shared/types/settings';
import { DEFAULT_SETTINGS } from '@app/lib/game/settings';
import { SegmentedControl } from '../../../../../design-system/primitives/SegmentedControl';
import { Slider } from '../../../../../design-system/primitives/Slider';
import { DialogColorControl } from './dialog-color-control';
import { DialogStopSlider } from './dialog-stop-slider';
import {
  ANIMATION_OPTIONS, DIALOG_TEXTURE_SCALES, SPEED_OPTIONS, TEXTURE_OPTIONS,
} from './hud-settings.constants';

const renderTextureControl = (key: string, settings: GameSettings, onChange: (patch: Partial<GameSettings>) => void, disabled: boolean): ReactNode | null => {
  switch (key) {
    case 'dialogTexture':
      return (
        <SegmentedControl
          label="Pattern"
          description="A repeating pattern on the ground behind the text"
          value={settings.dialogTexture}
          options={TEXTURE_OPTIONS}
          onChange={(v) => onChange({ dialogTexture: v as GameSettings['dialogTexture'] })}
          disabled={disabled}
        />
      );
    case 'dialogTextureColor':
      return (
        <DialogColorControl
          label="Pattern Color"
          description="The colour the pattern is drawn in"
          value={settings.dialogTextureColor}
          original={DEFAULT_SETTINGS.dialogTextureColor}
          onChange={(hex) => onChange({ dialogTextureColor: hex })}
          disabled={disabled}
        />
      );
    case 'dialogTextureOpacity':
      return (
        <Slider
          label="Pattern Opacity"
          description="How visible the pattern is"
          value={Math.round(settings.dialogTextureOpacity * 100)}
          min={0}
          max={100}
          step={5}
          formatValue={(v) => `${v}%`}
          onChange={(v) => onChange({ dialogTextureOpacity: v / 100 })}
          disabled={disabled}
        />
      );
    case 'dialogTextureAnimation':
      return (
        <SegmentedControl
          label="Animation"
          description="Still, sliding sideways, drifting, cells appearing at random, or the whole field breathing"
          value={settings.dialogTextureAnimation}
          options={ANIMATION_OPTIONS}
          onChange={(v) => onChange({ dialogTextureAnimation: v as GameSettings['dialogTextureAnimation'] })}
          disabled={disabled}
        />
      );
    case 'dialogTextureSpeed':
      return (
        <SegmentedControl
          label="Animation Speed"
          value={settings.dialogTextureSpeed}
          options={SPEED_OPTIONS}
          onChange={(v) => onChange({ dialogTextureSpeed: v as GameSettings['dialogTextureSpeed'] })}
          disabled={disabled}
        />
      );
    case 'dialogTextureScale':
      return (
        <DialogStopSlider
          label="Size"
          description="How large each cell of the pattern draws"
          stops={DIALOG_TEXTURE_SCALES}
          value={settings.dialogTextureScale}
          onChange={(stop) => onChange({ dialogTextureScale: stop })}
          formatStop={(stop) => stop + 'x'}
          disabled={disabled}
        />
      );
    case 'dialogTextureDensity':
      return (
        <Slider
          label="Density"
          description="How close the cells sit"
          value={settings.dialogTextureDensity}
          min={0}
          max={100}
          step={5}
          formatValue={(v) => v + '%'}
          onChange={(v) => onChange({ dialogTextureDensity: v })}
          disabled={disabled}
        />
      );
    case 'dialogTextureScatter':
      return (
        <Slider
          label="Scatter"
          description="How far cells stray from the grid; at zero they line up"
          value={settings.dialogTextureScatter}
          min={0}
          max={100}
          step={5}
          formatValue={(v) => v + '%'}
          onChange={(v) => onChange({ dialogTextureScatter: v })}
          disabled={disabled}
        />
      );
    default:
      return null;
  }
};

export { renderTextureControl };
