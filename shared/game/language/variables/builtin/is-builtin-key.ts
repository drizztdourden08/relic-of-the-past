/* @layer shared-game @kind logic */
import { NUMBER_KEY, PLAYER_NAME_KEY } from './builtin.constants';

const isBuiltinKey = (key: string): boolean => key === PLAYER_NAME_KEY || key === NUMBER_KEY;

export { isBuiltinKey };
