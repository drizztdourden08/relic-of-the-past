/* @layer bridge-wasm @kind logic */
import { PROTOCOL_NAME, SUPPORTED_PROTOCOL_VERSIONS } from '@drizztdourden08/archipelia-lobby-protocol';
import type { DecodeOutcome, LobbyRef } from '@drizztdourden08/archipelia-lobby-protocol';
import { createBrowserSocket } from '../../browser-socket';
import { closedEarly, connectionFailed, failureOfError, invalidCode, timedOut } from '../failure';
import { openLobbyLink } from '../link/open-lobby-link';
import { INFO_TIMEOUT_MS } from '../lobby.constants';
import { formatLobbyRef } from '../ref/format-lobby-ref';
import type { LobbyInfoDeps, LobbyInfoResult } from './lobby-info.type';

const replyOf = (outcome: DecodeOutcome): LobbyInfoResult | null => {
  if (!outcome.ok || !outcome.known) return null;
  const { message } = outcome;
  if (message.type === 'error') return { ok: false, failure: failureOfError(message) };
  if (message.type !== 'lobby.info.reply') return null;
  const { type: _type, re: _re, ...info } = message;
  return { ok: true, info };
};

const lobbyInfo = (server: string, lobby: LobbyRef, deps: LobbyInfoDeps = {}): Promise<LobbyInfoResult> =>
  new Promise((resolve) => {
    const ref = formatLobbyRef(lobby);
    if (ref === null) {
      resolve({ ok: false, failure: invalidCode() });
      return;
    }
    let done = false;
    const settle = (result: LobbyInfoResult): void => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      link.close();
      resolve(result);
    };
    const link = openLobbyLink(server, deps.createSocket ?? createBrowserSocket, {
      onOpen: () => {
        link.send({
          type: 'lobby.info',
          seq: link.nextSeq(),
          protocol: { name: PROTOCOL_NAME, versions: deps.protocolVersions ?? SUPPORTED_PROTOCOL_VERSIONS },
          lobby: ref,
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

export { lobbyInfo };
