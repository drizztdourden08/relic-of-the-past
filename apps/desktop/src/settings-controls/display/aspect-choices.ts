/* @layer renderer-app @kind logic */
import type { GameSettings } from '@rotp/features';
import { TALL_PRESETS } from './display.constants';
import type { AspectChoices } from './display.type';

const widePresetsOf = (s: GameSettings) => [
  { value: '4:3', label: '4:3' },
  { value: '16:9', label: '16:9' },
  { value: '16:10', label: '16:10' },
  ...(s.linearWorldTilemap ? [{ value: '21:9', label: '21:9' }] : []),
  ...(s.linearWorldTilemap && s.ultrawideRendering ? [{ value: '32:9', label: '32:9' }] : []),
];

const optionsOf = (s: GameSettings) => [
  { value: 'original', label: 'Original' },
  { value: 'auto', label: 'Auto' },
  { value: 'screen', label: 'Screen' },
  { value: 'wide', label: 'Wide' },
  ...(s.tallRendering ? [{ value: 'tall', label: 'Tall' }] : []),
  { value: 'custom', label: 'Custom' },
];

const aspectChoices = (s: GameSettings): AspectChoices => ({
  options: optionsOf(s),
  widePresets: widePresetsOf(s),
  tallPresets: s.tallRendering ? TALL_PRESETS : undefined,
});

export { aspectChoices };
