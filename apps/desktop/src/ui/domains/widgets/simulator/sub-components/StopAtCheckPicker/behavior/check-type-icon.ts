/* @layer renderer-widgets @kind logic */
import type { CheckKind } from '@rotp/game-data';
import { CHECK_TYPE_ICONS } from '../StopAtCheckPicker.constants';

const checkTypeIcon = (type: CheckKind): string => CHECK_TYPE_ICONS[type] ?? '•';

export { checkTypeIcon };
