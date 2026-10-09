/* @layer renderer-components @kind logic */
import type { Variable } from '@rotp/languages';

const isEditable = (variable: Variable): boolean => !variable.locked && variable.value !== null;

export { isEditable };
