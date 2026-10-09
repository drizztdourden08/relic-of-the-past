/* @layer renderer-lib @kind logic */
import { joinServerAddress } from '@app/lib/game/randomizer-client/server-address';
import type { ServerSetupDraft } from './server-setup-draft.type';

const serverUrlOf = (draft: ServerSetupDraft): string => joinServerAddress(draft);

export { serverUrlOf };
