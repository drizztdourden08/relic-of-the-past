/* @layer renderer-components @kind logic */
/**
 * The connection form's draft: the profile's connection as the fields show it, checked and
 * turned back into a profile patch. A `host:port` in the host field moves its port across.
 */
import { DEFAULT_SLOT_NAME } from '@app/lib/game/randomizer-client/online-config-of-profile';
import {
  joinServerAddress, serverAddressError, splitServerAddress,
} from '@app/lib/game/randomizer-client/server-address';
import type { ProfileRandomizerConfig, RandomizerConnectionPatch } from '@shared/types/profile';

interface ConnectionDraft {
  host: string;
  port: string;
  password: string;
  slotName: string;
  deathLink: boolean;
  trackOtherPlayers: boolean;
}

const draftOf = (config: ProfileRandomizerConfig): ConnectionDraft => ({
  ...splitServerAddress(config.serverUrl ?? ''),
  password: config.password ?? '',
  slotName: config.slotName ?? DEFAULT_SLOT_NAME,
  deathLink: config.deathLink === true,
  trackOtherPlayers: config.trackOtherPlayers !== false,
});

/** A host that carries its own port hands the port to the port field. */
const absorbPort = (draft: ConnectionDraft): ConnectionDraft => {
  const { host, port } = splitServerAddress(draft.host);
  return port === '' ? draft : { ...draft, host, port };
};

const draftError = (draft: ConnectionDraft): string | null =>
  serverAddressError(draft) ?? (draft.slotName.trim() === '' ? 'Enter a slot name.' : null);

const patchOf = (draft: ConnectionDraft): RandomizerConnectionPatch => ({
  serverUrl: joinServerAddress(draft),
  slotName: draft.slotName.trim(),
  password: draft.password === '' ? null : draft.password,
  deathLink: draft.deathLink,
  trackOtherPlayers: draft.trackOtherPlayers,
});

export { absorbPort, draftError, draftOf, patchOf };
export type { ConnectionDraft };
