/* @layer renderer-lib @kind logic */
import { joinServerAddress } from '@rotp/randomizer';
import type { ServerSetupDraft } from './server-setup-draft.type';

const serverUrlOf = (draft: ServerSetupDraft): string => joinServerAddress(draft);

export { serverUrlOf };
