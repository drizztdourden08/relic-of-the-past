/* @layer shared-game @kind logic */
import type { Variable } from '../types';
import { BUILTINS } from './builtin.constants';

const builtinVariables = (): Variable[] => BUILTINS.map((variable) => ({ ...variable }));

export { builtinVariables };
