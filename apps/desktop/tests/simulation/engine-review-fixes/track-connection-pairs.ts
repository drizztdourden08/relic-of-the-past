/* @layer tests @kind helper */
import { afterAll } from 'vitest';
import type { ConnectionId, ConnectionRecord } from '@rotp/game-data';
import { registerRecord, unregisterRecord } from '@rotp/game-data';

const EMPTY_PLACEMENT = { form: 'area' as const, tiles: [], rect: { x: 0, y: 0, w: 0, h: 0 } };

interface ConnectionPair {
  fromId: ConnectionId;
  from: string;
  toId: ConnectionId;
  to: string;
  nav?: ConnectionRecord['nav'];
}

const edgeRecord = (id: ConnectionId, screenId: string, toConnectionId: ConnectionId, nav: ConnectionRecord['nav']): ConnectionRecord =>
  ({ id, screenId, toConnectionId, kind: 'edge', placement: EMPTY_PLACEMENT, canExit: true, tags: [], nav } as unknown as ConnectionRecord);

const trackConnectionPairs = () => {
  const registeredIds: ConnectionId[] = [];

  afterAll(() => {
    for (const id of registeredIds) unregisterRecord('connection', id);
  });

  return ({ fromId, from, toId, to, nav }: ConnectionPair): ConnectionRecord => {
    const forward = edgeRecord(fromId, from, toId, nav);
    const backward = edgeRecord(toId, to, fromId, nav);
    for (const record of [forward, backward]) {
      if (!registerRecord('connection', record)) {
        unregisterRecord('connection', record.id);
        registerRecord('connection', record);
      }
    }
    registeredIds.push(fromId, toId);
    return forward;
  };
};

export { trackConnectionPairs };
