/* @layer renderer-components @kind logic */
import type { Token } from '@rotp/languages';
import { BLANK_ATTRS } from './token-attrs.constants';
import type { DialogueTokenAttrs } from './token-attrs.type';

const tokenToAttrs = (token: Token): DialogueTokenAttrs | null => {
  if (token.t === 'text') return null;
  if (token.t === 'break') return { ...BLANK_ATTRS, kind: 'break', row: token.row };
  if (token.t === 'var') {
    return { ...BLANK_ATTRS, kind: 'var', name: token.name, slot: token.slot ?? null };
  }
  if (token.t === 'ref') return { ...BLANK_ATTRS, kind: 'ref', key: token.key };
  return { ...BLANK_ATTRS, kind: 'cmd', name: token.name, param: token.param ?? null };
};

export { tokenToAttrs };
