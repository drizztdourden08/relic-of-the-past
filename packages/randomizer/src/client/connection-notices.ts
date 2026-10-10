/* @layer bridge-wasm @kind logic */
import { emitOnlineNotice, noticeOf, playerPart } from './online-notices';
import type { OnlineNotice } from './online-notices';
import type { NetworkState, NetworkStatus } from './network-status.type';
import { LOG_PREFIX } from './connection-notices.constants';

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
    case 'idle':
    case 'connecting':
      return null;
  }
};

const createConnectionNotices = (emit: (notice: OnlineNotice) => void = emitOnlineNotice) => {
  let last: NetworkState = 'idle';
  let everConnected = false;
  return (status: NetworkStatus): void => {
    const { state } = status.connection;
    if (state === last) return;
    const notice = noticeOfChange(last, status, everConnected);
    last = state;
    const sessionBoundary = state === 'connected' || state === 'idle';
    if (sessionBoundary) everConnected = state === 'connected';
    if (notice !== null) emit(notice);
  };
};

export { createConnectionNotices };
