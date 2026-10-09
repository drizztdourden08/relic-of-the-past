/* @layer renderer-components @kind logic */
import type { Token } from '@rotp/languages';
import { UNIT } from './tokens-signature.constants';

const partsOf = (token: Token): (string | number)[] => {
  if (token.t === 'text') return ['t', token.v];
  if (token.t === 'break') return ['b', token.row];
  if (token.t === 'cmd') return ['c', token.name, token.param ?? -1];
  if (token.t === 'var') return ['v', token.name, token.slot ?? -1];
  return ['r', token.key];
};

const signatureOf = (tokens: Token[]): string => (
  tokens.map((token) => partsOf(token).join(UNIT)).join(UNIT + UNIT)
);

export { signatureOf };
