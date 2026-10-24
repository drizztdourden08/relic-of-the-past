/* @layer renderer-lib @kind logic */
import { serverAddressError, slotNameError } from '@rotp/randomizer';
import type { ServerSetupDraft } from './server-setup-draft.type';

const draftError = (draft: ServerSetupDraft): string | null =>
  serverAddressError(draft) ?? (draft.slotName.trim() === '' ? 'Enter a slot name.' : slotNameError(draft.slotName));

export { draftError };
