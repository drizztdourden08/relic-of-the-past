/* @layer renderer-lib @kind logic */
import type { RandomizerConnectionPatch } from '@shared/types/profile';
import type { ServerSetupDraft } from './server-setup-draft.type';
import { serverUrlOf } from './serverUrlOf';

const patchOf = (draft: ServerSetupDraft): RandomizerConnectionPatch => ({
  serverUrl: serverUrlOf(draft),
  slotName: draft.slotName.trim(),
  password: draft.password === '' ? null : draft.password,
});

export { patchOf };
