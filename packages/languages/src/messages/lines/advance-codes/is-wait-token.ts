/* @layer shared-game @kind logic */
import type { Token } from '../../types';
import { WAIT_COMMAND } from './advance-codes.constants';
import { isParamlessCmd } from './is-paramless-cmd';

const isWaitToken = (token: Token): boolean => isParamlessCmd(token, WAIT_COMMAND);

export { isWaitToken };
