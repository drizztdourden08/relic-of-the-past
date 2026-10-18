/* @layer renderer-components @kind constants */
import type { ArmedIconName } from '@drizztdourden08/tessera/primitives';
import type { ArmedAction } from './behavior/useArmedAction.type';

const ARM_TIMEOUT_MS = 3000;

const ARMED_ICONS: Readonly<Record<ArmedAction, ArmedIconName>> = {
  load: 'load-state',
  save: 'save-state',
  delete: 'trash-2',
};

const ARMED_ICON_SIZE_PX = 20;

export { ARM_TIMEOUT_MS, ARMED_ICON_SIZE_PX, ARMED_ICONS };
