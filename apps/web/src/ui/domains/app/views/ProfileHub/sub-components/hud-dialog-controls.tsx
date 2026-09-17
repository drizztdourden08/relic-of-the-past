/* @layer renderer-components @kind component */
/**
 * Control renderer + disabled rules for the Dialog Box section of the HUD settings tab: the box,
 * text and background rows live here, the border and texture rows in their own renderers.
 */
import type { ReactNode } from 'react';
import type { GameSettings } from '@shared/types/settings';
import { DIALOG_FONT_SCALES, DIALOG_STROKE_WIDTHS } from '@shared/game/dialog/pacing';
import { DEFAULT_SETTINGS } from '@app/lib/game/settings';
import { SegmentedControl } from '../../../../../design-system/primitives/SegmentedControl';
import { Slider } from '../../../../../design-system/primitives/Slider';
import { DialogStopSlider } from './dialog-stop-slider';
import { DialogColorControl } from './dialog-color-control';
import { renderBorderControl, isBorderDisabled } from './hud-dialog-border-controls';
import { renderTextureControl, isTextureDisabled } from './hud-dialog-texture-controls';

const BOX_OPTIONS = [
  { value: 'original', label: 'Original' },
  { value: 'enhanced', label: 'Enhanced' },
];

const FONT_OPTIONS = [
  { value: 'original', label: 'Original' },
  { value: 'modern', label: 'Modern' },
];

const FIT_OPTIONS = [
  { value: 'full', label: 'Full' },
  { value: 'message', label: 'Message' },
  { value: 'fit', label: 'Fit' },
];

const MODERN_ONLY_KEYS = new Set(['dialogFontScale', 'dialogInkColor', 'dialogStrokeColor', 'dialogStrokeWidth']);

/** Every row but the box switch describes the enhanced box, so the original box idles them all. */
const isDialogDisabled = (key: string, settings: GameSettings): boolean => {
  if (key === 'dialogBox') return false;
  if (settings.dialogBox === 'original') return true;
  if (MODERN_ONLY_KEYS.has(key) && settings.dialogFont === 'original') return true;
  return isBorderDisabled(key, settings) || isTextureDisabled(key, settings);
};

const renderDialogControl = (key: string, settings: GameSettings, onChange: (patch: Partial<GameSettings>) => void): ReactNode | null => {
  const disabled = isDialogDisabled(key, settings);
  switch (key) {
    case 'dialogBox':
      return (
        <SegmentedControl
          label="Box"
          description="Original keeps the game's box. Enhanced draws it as an overlay you can style."
          value={settings.dialogBox}
          options={BOX_OPTIONS}
          onChange={(v) => onChange({ dialogBox: v as GameSettings['dialogBox'] })}
        />
      );
    case 'dialogBoxFit':
      return (
        <SegmentedControl
          label="Width"
          description="Full keeps the original size. Message sizes the box once to the whole message. Fit follows the text as it types."
          value={settings.dialogBoxFit}
          options={FIT_OPTIONS}
          onChange={(v) => onChange({ dialogBoxFit: v as GameSettings['dialogBoxFit'] })}
          disabled={disabled}
        />
      );
    case 'dialogFont':
      return (
        <SegmentedControl
          label="Font"
          description="Original uses the game's glyphs. Modern uses the app's dialogue font."
          value={settings.dialogFont}
          options={FONT_OPTIONS}
          onChange={(v) => onChange({ dialogFont: v as GameSettings['dialogFont'] })}
          disabled={disabled}
        />
      );
    case 'dialogFontScale':
      return (
        <DialogStopSlider
          label="Font Size"
          description="How large the modern font draws"
          stops={DIALOG_FONT_SCALES}
          value={settings.dialogFontScale}
          onChange={(stop) => onChange({ dialogFontScale: stop as GameSettings['dialogFontScale'] })}
          formatStop={(stop) => `${stop}x`}
          disabled={disabled}
        />
      );
    case 'dialogInkColor':
      return (
        <DialogColorControl
          label="Ink Color"
          description="The colour the modern font is written in"
          value={settings.dialogInkColor}
          original={DEFAULT_SETTINGS.dialogInkColor}
          onChange={(hex) => onChange({ dialogInkColor: hex })}
          disabled={disabled}
        />
      );
    case 'dialogStrokeColor':
      return (
        <DialogColorControl
          label="Stroke Color"
          description="The outline colour around each modern glyph"
          value={settings.dialogStrokeColor}
          original={DEFAULT_SETTINGS.dialogStrokeColor}
          onChange={(hex) => onChange({ dialogStrokeColor: hex })}
          disabled={disabled}
        />
      );
    case 'dialogStrokeWidth':
      return (
        <DialogStopSlider
          label="Stroke Width"
          description="How thick the outline is, in game pixels"
          stops={DIALOG_STROKE_WIDTHS}
          value={settings.dialogStrokeWidth}
          onChange={(stop) => onChange({ dialogStrokeWidth: stop as GameSettings['dialogStrokeWidth'] })}
          formatStop={(stop) => (stop === 0 ? 'None' : `${stop}px`)}
          disabled={disabled}
        />
      );
    case 'dialogGroundColor':
      return (
        <DialogColorControl
          label="Background Color"
          description="The ground behind the text"
          value={settings.dialogGroundColor}
          original={DEFAULT_SETTINGS.dialogGroundColor}
          onChange={(hex) => onChange({ dialogGroundColor: hex })}
          disabled={disabled}
        />
      );
    case 'dialogBoxOpacity':
      return (
        <Slider
          label="Background Opacity"
          description="How solid the ground is, from clear to solid"
          value={Math.round(settings.dialogBoxOpacity * 100)}
          min={0}
          max={100}
          step={5}
          formatValue={(v) => `${v}%`}
          onChange={(v) => onChange({ dialogBoxOpacity: v / 100 })}
          disabled={disabled}
        />
      );
    default:
      return renderBorderControl(key, settings, onChange, disabled) ?? renderTextureControl(key, settings, onChange, disabled);
  }
};

export { renderDialogControl, isDialogDisabled };
