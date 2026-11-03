/* @layer bridge-wasm @kind logic */
import { PROTOCOL_NAME, SUPPORTED_PROTOCOL_VERSIONS } from '@drizztdourden08/archipelia-lobby-protocol';
import type { DecodeOutcome } from '@drizztdourden08/archipelia-lobby-protocol';
import { createBrowserSocket } from '../../browser-socket';
import { closedEarly, connectionFailed, failureOfError, timedOut } from '../failure';
import { openLobbyLink } from '../link/open-lobby-link';
import { INFO_TIMEOUT_MS } from '../lobby.constants';
import type { LobbyBrowseDeps, LobbyBrowseResult } from './lobby-browse.type';

const replyOf = (outcome: DecodeOutcome): LobbyBrowseResult | null => {
  if (!outcome.ok || !outcome.known) return null;
  const { message } = outcome;
  if (message.type === 'error') return { ok: false, failure: failureOfError(message) };
  return message.type === 'lobby.browse.reply' ? { ok: true, lobbies: message.lobbies } : null;
};

const lobbyBrowse = (server: string, deps: LobbyBrowseDeps = {}): Promise<LobbyBrowseResult> =>
  new Promise((resolve) => {
    let done = false;
    const settle = (result: LobbyBrowseResult): void => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      link.close();
      resolve(result);
    };
    const link = openLobbyLink(server, deps.createSocket ?? createBrowserSocket, {
      onOpen: () => {
        link.send({
          type: 'lobby.browse',
          seq: link.nextSeq(),
          protocol: { name: PROTOCOL_NAME, versions: deps.protocolVersions ?? SUPPORTED_PROTOCOL_VERSIONS },
        });
      },
      onMessage: (outcome) => {
        const result = replyOf(outcome);
        if (result !== null) settle(result);
      },
      onClose: (opened) => settle({ ok: false, failure: opened ? closedEarly() : connectionFailed(server) }),
    });
    const timer = setTimeout(() => settle({ ok: false, failure: timedOut() }), deps.timeoutMs ?? INFO_TIMEOUT_MS);
  });

export { lobbyBrowse };
