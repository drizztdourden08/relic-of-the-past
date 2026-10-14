/* @layer renderer-components @kind logic */
import type { Token } from '@rotp/languages';
import { PAUSE_CODE, WAIT_BUTTON_CODE } from './entry.constants';
import type { EntryTally } from './entry.type';

const named = (tokens: Token[], kind: 'var' | 'cmd', name: string): number =>
  tokens.filter((token) => (token.t === 'var' || token.t === 'cmd') && token.t === kind && token.name === name).length;

const termsOf = (tokens: Token[]): string[] =>
  [...new Set(tokens.flatMap((token) => (token.t === 'ref' ? [token.key] : [])))];

const tallyTokens = (tokens: Token[]): EntryTally => ({
  insertsName: named(tokens, 'var', 'player-name') > 0,
  digits: named(tokens, 'var', 'number'),
  terms: termsOf(tokens),
  waits: named(tokens, 'cmd', WAIT_BUTTON_CODE),
  pauses: named(tokens, 'cmd', PAUSE_CODE),
});

export { tallyTokens };
