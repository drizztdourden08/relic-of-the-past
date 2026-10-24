/* @layer renderer-lib @kind logic */
import type { PatternValue } from '@drizztdourden08/tessera/composites';
import { CODE_HALF, HOST_NAME } from './lobby-draft.constants';
import { lobbyCodeOf } from './lobby-code-of';
import type { DraftProblems, LobbyDraft } from './lobby-draft.type';
import { slotText } from './slot-text';
import { typedCode } from './typed-code';

const addressWrong = (address: PatternValue): boolean => {
  const host = slotText(address.host);
  return address.kind !== 'ip' && host !== '' && !HOST_NAME.test(host);
};

const codeWrong = (code: PatternValue): boolean => typedCode(code).length === CODE_HALF * 2 && lobbyCodeOf(code) === null;

const draftProblems = (draft: LobbyDraft): DraftProblems => ({
  address: draft.location === 'remote' && addressWrong(draft.address),
  code: codeWrong(draft.code),
});

export { draftProblems };
