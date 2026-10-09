/* @layer renderer-components @kind constants */
import type { DialogueTokenAttrs } from './token-attrs.type';

const DIALOGUE_TOKEN_TYPE = 'dialogueToken';

const BLANK_ATTRS: DialogueTokenAttrs = {
  kind: 'cmd', name: null, param: null, row: null, slot: null, key: null,
};

export { DIALOGUE_TOKEN_TYPE, BLANK_ATTRS };
