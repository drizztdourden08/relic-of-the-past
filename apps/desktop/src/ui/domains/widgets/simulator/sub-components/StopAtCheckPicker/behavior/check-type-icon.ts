/* @layer renderer-widgets @kind logic */
import type { CheckKind } from '@shared/game/data';
import { CHECK_TYPE_ICONS } from '../StopAtCheckPicker.constants';

const checkTypeIcon = (type: CheckKind): string => CHECK_TYPE_ICONS[type] ?? '•';

export { checkTypeIcon };
