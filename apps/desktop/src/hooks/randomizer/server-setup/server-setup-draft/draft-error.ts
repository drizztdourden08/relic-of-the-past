/* @layer renderer-lib @kind logic */
import { serverAddressError } from '@app/lib/game/randomizer-client/server-address';
import type { ServerSetupDraft } from './server-setup-draft.type';

const draftError = (draft: ServerSetupDraft): string | null =>
  serverAddressError(draft) ?? (draft.slotName.trim() === '' ? 'Enter a slot name.' : null);

export { draftError };
