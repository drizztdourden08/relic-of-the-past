/* @layer renderer-components @kind logic */
import { codeInfoFor, resolve } from '@shared/game/language';
import type { Token, VariableIndex } from '@shared/game/language';

const unresolvedReference = (key: string): string => `{${key}}`;

const textOf = (tokens: Token[]): string =>
  tokens.map((token) => (token.t === 'text' ? token.v : '')).join('');

const tolerantText = (tokens: Token[], index: VariableIndex): string => tokens.map((token) => {
  if (token.t === 'text') return token.v;
  if (token.t !== 'ref') return '';
  return index.get(token.key)?.value ?? unresolvedReference(token.key);
}).join('');

const flattened = (token: Token): Token[] => {
  if (token.t === 'break') return [{ t: 'text', v: ' ' }];
  if (token.t !== 'cmd') return [token];
  if (token.param !== undefined) return [];
  return codeInfoFor(token.name) ? [{ t: 'text', v: ' ' }] : [{ t: 'text', v: `[${token.name}]` }];
};

const proseOf = (tokens: Token[], index: VariableIndex): string => {
  const spaced = tokens.flatMap(flattened);

  try {
    return textOf(resolve(spaced, index, { mode: 'preview' }));
  } catch {
    return tolerantText(spaced, index);
  }
};

export { proseOf };
