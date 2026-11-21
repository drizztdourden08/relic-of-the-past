/* @layer renderer-components @kind constants */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { Preset } from './presets.type';

const PAUSE_CODE = 'Wait';
const SPEED_CODE = 'Speed';

const PAUSE_PRESETS: readonly Preset[] = [
  { param: 0, label: msg('language-editor:presets.pause.half') },
  { param: 3, label: msg('language-editor:presets.pause.two') },
  { param: 7, label: msg('language-editor:presets.pause.four') },
  { param: 15, label: msg('language-editor:presets.pause.eight') },
];

const SPEED_PRESETS: readonly Preset[] = [
  { param: 0, label: msg('language-editor:presets.speed.instant') },
  { param: 1, label: msg('language-editor:presets.speed.fast') },
  { param: 2, label: msg('language-editor:presets.speed.normal') },
  { param: 4, label: msg('language-editor:presets.speed.slow') },
];

export { PAUSE_CODE, PAUSE_PRESETS, SPEED_CODE, SPEED_PRESETS };
