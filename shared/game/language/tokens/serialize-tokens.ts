/* @layer shared-game @kind logic */
import type { Token } from '../types';

const formatParam = (param: number): string => String(param).padStart(2, '0');

const bracket = (name: string, param: number | undefined): string => (
  param === undefined ? `[${name}]` : `[${name} ${formatParam(param)}]`
);

const serializeToken = (token: Token): string => {
  if (token.t === 'text') return token.v;
  if (token.t === 'break') return `[${token.row}]`;
  if (token.t === 'cmd') return bracket(token.name, token.param);
  if (token.t === 'var') {
    if (token.name === 'player-name') return '[Name]';
    return bracket('Number', token.slot);
  }
  throw new Error(
    `serializeTokens: unresolved glossary reference "${token.key}". `
    + 'Run resolveRefs on the token stream before serializing it.',
  );
};

const serializeTokens = (tokens: Token[]): string => tokens.map(serializeToken).join('');

export { serializeTokens };
