/* @layer shared-game @kind logic */
import type { Token } from '../types';
import { BRACKET_RE, PARAM_RE } from './parse-tokens.constants';

const kPlayerNameCommand = 'Name';
const kNumberCommand = 'Number';

const isBreakRow = (name: string): name is '1' | '2' | '3' => (
  name === '1' || name === '2' || name === '3'
);

const paramlessToken = (name: string): Token => {
  if (isBreakRow(name)) return { t: 'break', row: Number(name) as 1 | 2 | 3 };
  if (name === kPlayerNameCommand) return { t: 'var', name: 'player-name' };
  if (name === kNumberCommand) return { t: 'var', name: 'number' };
  return { t: 'cmd', name };
};

const codeToken = (inner: string): Token => {
  const withParam = PARAM_RE.exec(inner);
  if (!withParam) return paramlessToken(inner);

  const name = withParam[1];
  const param = Number(withParam[2]);
  if (name === kNumberCommand) return { t: 'var', name: 'number', slot: param };
  return { t: 'cmd', name, param };
};

const parseTokens = (content: string): Token[] => {
  const tokens: Token[] = [];
  let last = 0;

  for (const match of content.matchAll(BRACKET_RE)) {
    const start = match.index;
    if (start > last) tokens.push({ t: 'text', v: content.slice(last, start) });
    tokens.push(codeToken(match[0].slice(1, -1)));
    last = start + match[0].length;
  }
  if (last < content.length) tokens.push({ t: 'text', v: content.slice(last) });

  return tokens;
};

export { parseTokens };
