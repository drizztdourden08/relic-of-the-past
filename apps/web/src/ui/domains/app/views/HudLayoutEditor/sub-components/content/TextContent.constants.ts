/* @layer renderer-components @kind constants */
import type { HudTextAlign, HudTextPad } from '@shared/types/hud';
import type { SpriteSetOption } from './TextContent.type';

const ALIGNS: readonly HudTextAlign[] = ['start', 'center', 'end'];
const PADS: readonly HudTextPad[] = ['none', 'zero', 'space'];

const SPRITE_SETS: readonly SpriteSetOption[] = [
  { value: 'hud-digits', label: 'HUD digits', specimen: '07', warn: 'This face has digits only. Letters will not draw.' },
  { value: 'pause-letters', label: 'Pause letters', specimen: 'Ab', warn: undefined },
];

export { ALIGNS, PADS, SPRITE_SETS };
