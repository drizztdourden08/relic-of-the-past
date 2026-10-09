/* @layer shared-game @kind logic */
import type { Token } from '../../types';
import { WAIT_COMMAND } from './advance-codes.constants';

const waitToken = (): Token => ({ t: 'cmd', name: WAIT_COMMAND });

export { waitToken };
