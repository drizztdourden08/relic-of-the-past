/* @layer shared-input @kind constants */
import type { CoreBindings } from '../../types/controls';

const MENU_CONSUMED_VERBS: readonly (keyof CoreBindings)[] = [
  'up', 'down', 'left', 'right', 'pause', 'confirm', 'cancel', 'prevScreen', 'nextScreen',
];

export { MENU_CONSUMED_VERBS };
