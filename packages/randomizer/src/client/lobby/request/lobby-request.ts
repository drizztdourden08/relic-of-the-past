/* @layer bridge-wasm @kind logic */
import { PROTOCOL_NAME, SUPPORTED_PROTOCOL_VERSIONS } from '@drizztdourden08/archipelia-lobby-protocol';
import type { DecodeOutcome } from '@drizztdourden08/archipelia-lobby-protocol';
import { createBrowserSocket } from '../../browser-socket';
import { closedEarly, connectionFailed, failureOfError, timedOut } from '../failure';
import { openLobbyLink } from '../link/open-lobby-link';
import { INFO_TIMEOUT_MS } from '../lobby.constants';
import type { LobbyRequestSpec } from './lobby-request.type';

const lobbyRequest = <R>(spec: LobbyRequestSpec<R>): Promise<R> =>
  new Promise((resolve) => {
    const { server, deps, build, pick, failed } = spec;
    let done = false;
    const settle = (result: R): void => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      link.close();
      resolve(result);
    };
    const resultOf = (outcome: DecodeOutcome): R | null => {
      if (!outcome.ok || !outcome.known) return null;
      const { message } = outcome;
      return message.type === 'error' ? failed(failureOfError(message)) : pick(message);
    };
    const link = openLobbyLink(server, deps.createSocket ?? createBrowserSocket, {
      onOpen: () => {
        link.send(build(link.nextSeq(), { name: PROTOCOL_NAME, versions: deps.protocolVersions ?? SUPPORTED_PROTOCOL_VERSIONS }));
      },
      onMessage: (outcome) => {
        const result = resultOf(outcome);
        if (result !== null) settle(result);
      },
      onClose: (opened) => settle(failed(opened ? closedEarly() : connectionFailed(server))),
    });
    const timer = setTimeout(() => settle(failed(timedOut())), deps.timeoutMs ?? INFO_TIMEOUT_MS);
  });

export { lobbyRequest };
