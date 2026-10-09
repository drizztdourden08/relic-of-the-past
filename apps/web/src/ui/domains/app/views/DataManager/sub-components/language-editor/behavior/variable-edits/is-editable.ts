/* @layer renderer-components @kind logic */
import type { Variable } from '@shared/game/language';

const isEditable = (variable: Variable): boolean => !variable.locked && variable.value !== null;

export { isEditable };
