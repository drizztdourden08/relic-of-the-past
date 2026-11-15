/* @layer renderer-components @kind logic */
import type { Token } from '@rotp/languages';
import type { GlyphNames } from '../../language-editor.type';
import { renameInText } from './rename-in-text';

const renamedToken = (token: Token, names: GlyphNames): Token => {
  if (token.t === 'text') return { t: 'text', v: renameInText(token.v, names) };
  if (token.t !== 'cmd' || token.param !== undefined) return token;
  const letter = names[`[${token.name}]`];
  return letter === undefined ? token : { t: 'text', v: letter };
};

const mergeText = (tokens: Token[], token: Token): Token[] => {
  const last = tokens[tokens.length - 1];
  if (token.t !== 'text' || last?.t !== 'text') return [...tokens, token];
  return [...tokens.slice(0, -1), { t: 'text', v: `${last.v}${token.v}` }];
};

const renameGlyphTokens = (tokens: Token[], names: GlyphNames): Token[] =>
  tokens.map((token) => renamedToken(token, names)).reduce<Token[]>(mergeText, []);

export { renameGlyphTokens };
