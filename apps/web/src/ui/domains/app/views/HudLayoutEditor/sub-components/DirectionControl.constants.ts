/* @layer renderer-components @kind constants */
import arrowDown from '@iconify-icons/lucide/arrow-down';
import arrowRight from '@iconify-icons/lucide/arrow-right';
import type { DirectionOption } from './DirectionControl.type';

const DIRECTIONS: readonly DirectionOption[] = [
  { value: 'row', icon: arrowRight, label: 'row. Children flow left to right' },
  { value: 'column', icon: arrowDown, label: 'column. Children flow top to bottom' },
];

export { DIRECTIONS };
