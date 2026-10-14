/* @layer renderer-widgets @kind logic */
import type { CheckKind } from '@rotp/game-data';
import type { IconName } from '@drizztdourden08/tessera/primitives';
import { CHECK_TYPE_ICONS } from '../StopAtCheckPicker.constants';

const checkTypeIcon = (type: CheckKind): IconName => CHECK_TYPE_ICONS[type];

export { checkTypeIcon };
