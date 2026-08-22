/* @layer shared-game @kind logic */
/**
 * Token stream to bracket string — the export half of the adapter, and the
 * exact inverse of `parseTokens` for every string the dialogue decoder can
 * emit. The output feeds the existing compression path, so the shape must match
 * `formatDialogueText` byte for byte: a param is rendered decimal and padded to
 * a minimum of two digits (`0` -> `00`, `15` -> `15`, `255` -> `255`).
 *
 * A `ref` token cannot be serialized: glossary references are expanded by
 * `resolveRefs` first, and reaching one here means that step was skipped.
 */
import type { Token } from '../types';

/** Same padding rule the decoder uses when it renders a command param. */
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
