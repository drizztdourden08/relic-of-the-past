/* @layer renderer-app @kind logic */
import { createElement } from 'react';
import type { ReactNode } from 'react';
import { DIALOG_FONT_SCALES, DIALOG_STROKE_WIDTHS } from '@rotp/game-data';
import type { GameSettings } from '@rotp/features';
import { HudStyleControl } from '../HudStyleControl';
import { stopSlider } from '../IndexSlider';
import { HudRatioInput } from './HudRatioInput';
import { TitleSwordButton } from './TitleSwordButton';
import { DIALOG_TEXTURE_SCALES } from './hud-controls.constants';
import type { ControlContext } from '../settings-controls.type';

const timesLabel = (stop: number): string => `${stop}x`;
const strokeLabel = (stop: number): string => (stop === 0 ? 'None' : `${stop}px`);

const styleControl = (ctx: ControlContext): ReactNode => createElement(HudStyleControl, {
  value: ctx.settings.hudStyle,
  settings: ctx.settings,
  onChange: (hudStyle: GameSettings['hudStyle']) => ctx.onChange({ hudStyle }),
});

const sliderControl = (key: string, ctx: ControlContext): ReactNode | null => {
  const { settings, onChange, disabled } = ctx;
  switch (key) {
    case 'dialogFontScale':
      return stopSlider({ settingKey: key, stops: DIALOG_FONT_SCALES, value: settings.dialogFontScale, format: timesLabel, onStop: (stop) => onChange({ dialogFontScale: stop as GameSettings['dialogFontScale'] }), disabled });
    case 'dialogStrokeWidth':
      return stopSlider({ settingKey: key, stops: DIALOG_STROKE_WIDTHS, value: settings.dialogStrokeWidth, format: strokeLabel, onStop: (stop) => onChange({ dialogStrokeWidth: stop as GameSettings['dialogStrokeWidth'] }), disabled });
    case 'dialogTextureScale':
      return stopSlider({ settingKey: key, stops: DIALOG_TEXTURE_SCALES, value: settings.dialogTextureScale, format: timesLabel, onStop: (stop) => onChange({ dialogTextureScale: stop }), disabled });
    default:
      return null;
  }
};

const renderHudControl = (key: string, ctx: ControlContext): ReactNode | null => {
  switch (key) {
    case 'hudStyle': return styleControl(ctx);
    case 'hudRatio': return createElement(HudRatioInput, ctx);
    case 'titleSword': return createElement(TitleSwordButton, ctx);
    default: return sliderControl(key, ctx);
  }
};

export { renderHudControl };
