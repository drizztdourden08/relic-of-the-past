/* @layer renderer-components @kind constants */
import type { HudTextAlign, HudTextPad } from '@rotp/hud';
import type { SpriteSetOption } from './TextContent.type';
import { msg } from '@drizztdourden08/brock-core/i18n';

const ALIGNS: readonly HudTextAlign[] = ['start', 'center', 'end'];
const PADS: readonly HudTextPad[] = ['none', 'zero', 'space'];

const SPRITE_SETS: readonly SpriteSetOption[] = [
  { value: 'hud-digits', label: msg('hud-editor:text-face.hud-digits'), specimen: '07', warn: msg('hud-editor:text-face.digits-only') },
  { value: 'pause-letters', label: msg('hud-editor:text-face.pause-letters'), specimen: 'Ab', warn: undefined },
];

export { ALIGNS, PADS, SPRITE_SETS };
