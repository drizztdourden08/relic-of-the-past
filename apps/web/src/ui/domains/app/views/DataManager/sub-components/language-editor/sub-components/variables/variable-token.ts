/* @layer renderer-components @kind logic */
/**
 * The token one variable is inserted as.
 *
 * Two shapes, and which one is used is not a style choice. A variable the ENGINE
 * owns has to stay a control code all the way into the packed dialogue, because
 * the game performs that substitution itself at draw time. It is inserted as
 * the substitution token the serializer writes back. Everything else is OURS and
 * is inserted as a REFERENCE, which survives a later rename of the variable and
 * is expanded to literal text only at bake time.
 *
 * That is the whole reason a picker beats typing the text: the reference follows
 * the rename, the literal does not.
 */
import { NUMBER_KEY, PLAYER_NAME_KEY } from '@shared/game/language/variables';
import type { Token, Variable } from '@shared/game/language';

/** The token to insert for `variable`, or null when its key is unknown to the engine. */
const tokenForVariable = (variable: Variable): Token | null => {
  if (variable.kind !== 'engine') return { t: 'ref', key: variable.key };
  if (variable.key === PLAYER_NAME_KEY) return { t: 'var', name: 'player-name' };
  if (variable.key === NUMBER_KEY) return { t: 'var', name: 'number' };
  return null;
};

export { tokenForVariable };
