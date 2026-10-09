/* @layer renderer-lib @kind logic */
import { DEFAULT_SLOT_NAME } from '@app/lib/game/randomizer-client/online-config-of-profile';
import { splitServerAddress } from '@app/lib/game/randomizer-client/server-address';
import type { ConnectionFields, ServerSetupDraft } from './server-setup-draft.type';

const draftOf = (config: ConnectionFields): ServerSetupDraft => ({
  ...splitServerAddress(config.serverUrl ?? ''),
  password: config.password ?? '',
  slotName: config.slotName ?? DEFAULT_SLOT_NAME,
});

export { draftOf };
