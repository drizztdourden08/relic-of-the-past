/* @layer renderer-app @kind logic */
import type { ReactNode } from 'react';
import { Button } from '@drizztdourden08/tessera/primitives';
import { DIALOG_FONT_SCALES, DIALOG_STROKE_WIDTHS } from '@shared/game/dialog/pacing';
import { hostDrawnHud } from '@shared/features/hud-style';
import { nextTitleSword, titleSwordLabel } from '@shared/game/title/title-swords';
import type { GameSettings } from '@shared/types/settings';
import { AspectRatioControl } from '../AspectRatioControl';
import { KeyedControlRow } from '../ControlRow';
import { HudStyleControl } from '../HudStyleControl';
import { stopSliderRow } from '../IndexSliderRow';
import { colorRow } from './color-row';
import { hudRatioOptions } from './hud-ratio-options';
import { COLOR_KEYS, DIALOG_TEXTURE_SCALES, ENHANCED_PARTS_OPTIONS } from './hud-controls.constants';
import type { ControlContext } from '../settings-controls.type';
import type { ColorKey } from './hud.type';

const timesLabel = (stop: number): string => `${stop}x`;
const strokeLabel = (stop: number): string => (stop === 0 ? 'None' : `${stop}px`);
const isColorKey = (key: string): key is ColorKey => (COLOR_KEYS as readonly string[]).includes(key);

const styleChange = (ctx: ControlContext) => (hudStyle: GameSettings['hudStyle']) =>
  ctx.onChange(hostDrawnHud(hudStyle) ? { hudStyle, hudMode: 'enhanced', hudEnhancedParts: ['main', 'pause'] } : { hudStyle });

const renderHudRatio = (ctx: ControlContext): ReactNode => (
  <AspectRatioControl
    label="Aspect Ratio"
    description="Match keeps the overlay in sync with the game viewport. Fixed ratios pin the HUD to a narrower area; Custom accepts any ratio."
    value={ctx.settings.hudRatio}
    options={hudRatioOptions(ctx.settings)}
    customW={ctx.settings.customHudAspectW}
    customH={ctx.settings.customHudAspectH}
    ratioKey="hudRatio"
    wKey="customHudAspectW"
    hKey="customHudAspectH"
    onChange={ctx.onChange}
  />
);

const renderHudControl = (key: string, ctx: ControlContext): ReactNode | null => {
  const { settings, onChange, disabled } = ctx;
  if (isColorKey(key)) return colorRow(key, ctx);
  switch (key) {
    case 'hudStyle': return <HudStyleControl value={settings.hudStyle} settings={settings} onChange={styleChange(ctx)} />;
    case 'hudRatio': return renderHudRatio(ctx);
    case 'hudEnhancedParts':
      return <KeyedControlRow settingKey={key} input={{ kind: 'multi', value: settings.hudEnhancedParts, options: ENHANCED_PARTS_OPTIONS, onChange: (parts) => onChange({ hudEnhancedParts: [...parts] as GameSettings['hudEnhancedParts'] }) }} disabled={disabled} />;
    case 'titleSword': {
      const step = <Button variant="secondary" size="sm" disabled={disabled} onClick={() => onChange({ titleSword: nextTitleSword(settings.titleSword) })}>{titleSwordLabel(settings.titleSword)}</Button>;
      return <KeyedControlRow settingKey={key} input={{ kind: 'custom', control: step }} disabled={disabled} />;
    }
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

export { renderHudControl };
