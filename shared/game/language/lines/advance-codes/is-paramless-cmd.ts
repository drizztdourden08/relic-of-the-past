/* @layer shared-game @kind logic */
import type { Token } from '../../types';

const isParamlessCmd = (token: Token, name: string): boolean => (
  token.t === 'cmd' && token.param === undefined && token.name === name
);

export { isParamlessCmd };
