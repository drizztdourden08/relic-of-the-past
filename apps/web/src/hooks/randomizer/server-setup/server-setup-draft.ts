/* @layer renderer-lib @kind logic */
/**
 * The Archipelago server setup as its fields show it: host and port, password and slot. The
 * profile keeps one `host:port` string (server-address.ts); a `host:port` typed or pasted into
 * the host field moves its port across. The profile-creation form and the Randomizer page's
 * Network tab both edit a connection through this one draft, so they check and save alike.
 */
import { DEFAULT_SLOT_NAME } from '@app/lib/game/randomizer-client/online-config-of-profile';
import {
  joinServerAddress, serverAddressError, splitServerAddress,
} from '@app/lib/game/randomizer-client/server-address';
import type { ProfileRandomizerConfig, RandomizerConnectionPatch } from '@shared/types/profile';

interface ServerSetupDraft {
  host: string;
  port: string;
  password: string;
  slotName: string;
}

type ConnectionFields = Pick<ProfileRandomizerConfig, 'serverUrl' | 'slotName' | 'password'>;

/** Archipelago's own default port, which a room hosted with default settings listens on. */
const DEFAULT_PORT = '38281';

/** The setup a new profile starts on: no host yet, the default port and slot name. */
const EMPTY_SERVER_SETUP: ServerSetupDraft = { host: '', port: DEFAULT_PORT, password: '', slotName: DEFAULT_SLOT_NAME };

const draftOf = (config: ConnectionFields): ServerSetupDraft => ({
  ...splitServerAddress(config.serverUrl ?? ''),
  password: config.password ?? '',
  slotName: config.slotName ?? DEFAULT_SLOT_NAME,
});

/** A host that carries its own port hands the port to the port field. */
const absorbPort = (draft: ServerSetupDraft): ServerSetupDraft => {
  const { host, port } = splitServerAddress(draft.host);
  return port === '' ? draft : { ...draft, host, port };
};

/** The host field: a paste of `host:port` splits at once, typing waits for the field to be left. */
const withHost = (draft: ServerSetupDraft, host: string): ServerSetupDraft => {
  const next = { ...draft, host };
  return host.length - draft.host.length > 1 ? absorbPort(next) : next;
};

const draftError = (draft: ServerSetupDraft): string | null =>
  serverAddressError(draft) ?? (draft.slotName.trim() === '' ? 'Enter a slot name.' : null);

/** The address as the profile stores it. */
const serverUrlOf = (draft: ServerSetupDraft): string => joinServerAddress(draft);

const patchOf = (draft: ServerSetupDraft): RandomizerConnectionPatch => ({
  serverUrl: serverUrlOf(draft),
  slotName: draft.slotName.trim(),
  password: draft.password === '' ? null : draft.password,
});

const isSameDraft = (a: ServerSetupDraft, b: ServerSetupDraft): boolean =>
  a.host === b.host && a.port === b.port && a.password === b.password && a.slotName === b.slotName;

export { absorbPort, draftError, draftOf, EMPTY_SERVER_SETUP, isSameDraft, patchOf, serverUrlOf, withHost };
export type { ServerSetupDraft };
