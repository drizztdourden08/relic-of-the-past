/* @layer renderer-components @kind constants */
import arrowDown from '@iconify-icons/lucide/arrow-down';
import arrowRight from '@iconify-icons/lucide/arrow-right';
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { DirectionOption } from './DirectionControl.type';

const DIRECTIONS: readonly DirectionOption[] = [
  { value: 'row', icon: arrowRight, label: msg('hud-editor:direction.row') },
  { value: 'column', icon: arrowDown, label: msg('hud-editor:direction.column') },
];

export { DIRECTIONS };
