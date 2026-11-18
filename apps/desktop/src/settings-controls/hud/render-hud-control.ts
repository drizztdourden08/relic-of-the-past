/* @layer renderer-app @kind logic */
import { createElement } from 'react';
import type { ReactNode } from 'react';
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { Text } from '@drizztdourden08/brock-core/i18n';
import { DIALOG_FONT_SCALES, DIALOG_STROKE_WIDTHS } from '@rotp/game-data';
import type { GameSettings } from '@rotp/features';
import { HudStyleControl } from '../HudStyleControl';
import { stopSliderRow } from '../IndexSliderRow';
import { HudRatioRow } from './HudRatioRow';
import { TitleSwordRow } from './TitleSwordRow';
import { colorRow } from './color-row';
import { COLOR_KEYS, DIALOG_TEXTURE_SCALES } from './hud-controls.constants';
import type { ControlContext } from '../settings-controls.type';
import type { ColorKey } from './hud.type';

const timesLabel = (stop: number): string => `${stop}x`;
const strokeLabel = (stop: number): Text => (stop === 0 ? msg('settings-controls:hud.stroke.none') : `${stop}px`);
const isColorKey = (key: string): key is ColorKey => (COLOR_KEYS as readonly string[]).includes(key);

const styleRow = (ctx: ControlContext): ReactNode => createElement(HudStyleControl, {
  value: ctx.settings.hudStyle,
  settings: ctx.settings,
  onChange: (hudStyle: GameSettings['hudStyle']) => ctx.onChange({ hudStyle }),
});

const sliderRow = (key: string, ctx: ControlContext): ReactNode | null => {
  const { settings, onChange, disabled } = ctx;
  switch (key) {
    case 'dialogFontScale':
      return stopSliderRow({ settingKey: key, stops: DIALOG_FONT_SCALES, value: settings.dialogFontScale, format: timesLabel, onStop: (stop) => onChange({ dialogFontScale: stop as GameSettings['dialogFontScale'] }), disabled });
    case 'dialogStrokeWidth':
      return stopSliderRow({ settingKey: key, stops: DIALOG_STROKE_WIDTHS, value: settings.dialogStrokeWidth, format: strokeLabel, onStop: (stop) => onChange({ dialogStrokeWidth: stop as GameSettings['dialogStrokeWidth'] }), disabled });
    case 'dialogTextureScale':
      return stopSliderRow({ settingKey: key, stops: DIALOG_TEXTURE_SCALES, value: settings.dialogTextureScale, format: timesLabel, onStop: (stop) => onChange({ dialogTextureScale: stop }), disabled });
    default:
      return null;
  }
};

const renderHudControl = (key: string, ctx: ControlContext): ReactNode | null => {
  if (isColorKey(key)) return colorRow(key, ctx);
  switch (key) {
    case 'hudStyle': return styleRow(ctx);
    case 'hudRatio': return createElement(HudRatioRow, ctx);
    case 'titleSword': return createElement(TitleSwordRow, ctx);
    default: return sliderRow(key, ctx);
  }
};

export { renderHudControl };
