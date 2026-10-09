/* @layer shared-game @kind logic */
import type { Token } from '../../types';
import type { LineAdvance } from '../types';
import { SCROLL_COMMAND } from './advance-codes.constants';
import { isParamlessCmd } from './is-paramless-cmd';

const advanceOfToken = (token: Token): LineAdvance | undefined => {
  if (token.t === 'break') return { kind: 'row', row: token.row };
  if (isParamlessCmd(token, SCROLL_COMMAND)) return { kind: 'scroll' };
  return undefined;
};

export { advanceOfToken };
