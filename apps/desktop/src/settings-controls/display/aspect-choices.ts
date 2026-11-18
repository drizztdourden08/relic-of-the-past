/* @layer renderer-app @kind logic */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { GameSettings } from '@rotp/features';
import { textOptions } from '../text-options';
import type { TextOf } from '../settings-controls.type';
import { TALL_PRESETS, TALL_ULTRAWIDE_PRESET } from './display.constants';
import type { AspectChoices } from './display.type';

const widePresetsOf = (s: GameSettings) => [
  { value: '4:3', label: '4:3' },
  { value: '16:9', label: '16:9' },
  { value: '16:10', label: '16:10' },
  ...(s.linearWorldTilemap ? [{ value: '21:9', label: '21:9' }] : []),
  ...(s.linearWorldTilemap && s.ultrawideRendering ? [{ value: '32:9', label: '32:9' }] : []),
];

const tallPresetsOf = (s: GameSettings) => [
  ...TALL_PRESETS,
  ...(s.ultrawideRendering ? [{ value: TALL_ULTRAWIDE_PRESET, label: TALL_ULTRAWIDE_PRESET }] : []),
];

const optionsOf = (s: GameSettings, text: TextOf) => textOptions([
  { value: 'original', label: msg('settings-controls:display.aspect.original') },
  { value: 'auto', label: msg('settings-controls:display.aspect.auto') },
  { value: 'screen', label: msg('settings-controls:display.aspect.screen') },
  { value: 'wide', label: msg('settings-controls:display.aspect.wide') },
  ...(s.tallRendering ? [{ value: 'tall', label: msg('settings-controls:display.aspect.tall') }] : []),
  { value: 'custom', label: msg('settings-controls:display.aspect.custom') },
], text);

const aspectChoices = (s: GameSettings, text: TextOf): AspectChoices => ({
  options: optionsOf(s, text),
  widePresets: widePresetsOf(s),
  tallPresets: s.tallRendering ? tallPresetsOf(s) : undefined,
});

export { aspectChoices };
