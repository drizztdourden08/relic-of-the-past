/* @layer bridge-wasm @kind logic */
/**
 * The connection's changes as online notices, read off the network monitor's snapshots: the
 * slot accepted (at first, or again after a drop), the connection lost, the server not reached
 * at all, and the session ended by an error (a refusal among them). Only a change of state
 * speaks, so a retry that fails again says nothing new. A stop the player asked for is silent.
 */
import { emitOnlineNotice, noticeOf, playerPart } from './online-notices';
import type { OnlineNotice } from './online-notices';
import type { NetworkState, NetworkStatus } from './network-status.type';

const LOG_PREFIX = /^\[Online\]\s*/;

const noticeOfChange = (
  from: NetworkState, status: NetworkStatus, everConnected: boolean,
): OnlineNotice | null => {
  const { state, error, slotName } = status.connection;
  switch (state) {
    case 'connected':
      return everConnected
        ? noticeOf('connection', [{ text: 'Reconnected to the room' }])
        : noticeOf('connection', [{ text: 'Connected to the room as ' }, playerPart(slotName)]);
    case 'reconnecting':
      return from === 'connected' || everConnected
        ? noticeOf('connection', [{ text: 'Connection lost, reconnecting' }])
        : noticeOf('connection', [{ text: 'Could not reach the server, retrying' }]);
    case 'error':
      return noticeOf('connection', [{ text: error ? error.replace(LOG_PREFIX, '') : 'Connection ended' }]);
    default:
      return null;
  }
};

/** A listener for the monitor's snapshots that emits a notice on each change of state. */
const createConnectionNotices = (emit: (notice: OnlineNotice) => void = emitOnlineNotice) => {
  let last: NetworkState = 'idle';
  let everConnected = false;
  return (status: NetworkStatus): void => {
    const { state } = status.connection;
    if (state === last) return;
    const notice = noticeOfChange(last, status, everConnected);
    last = state;
    // A session started again after a stop connects for the first time again.
    if (state === 'connected' || state === 'idle') everConnected = state === 'connected';
    if (notice !== null) emit(notice);
  };
};

export { createConnectionNotices };
