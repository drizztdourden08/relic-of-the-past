/* @layer renderer-components @kind logic */
import { NUMBER_KEY, PLAYER_NAME_KEY } from '@shared/game/language/variables';
import type { Token, Variable } from '@shared/game/language';

const tokenForVariable = (variable: Variable): Token | null => {
  if (variable.kind !== 'engine') return { t: 'ref', key: variable.key };
  if (variable.key === PLAYER_NAME_KEY) return { t: 'var', name: 'player-name' };
  if (variable.key === NUMBER_KEY) return { t: 'var', name: 'number' };
  return null;
};

export { tokenForVariable };
