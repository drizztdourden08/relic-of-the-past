/* @layer tests @kind helper */
import { afterAll } from 'vitest';
import type { ConnectionId, ConnectionRecord } from '@rotp/game-data';
import { registerRecord, unregisterRecord } from '@rotp/game-data';

const EMPTY_PLACEMENT = { form: 'area' as const, tiles: [], rect: { x: 0, y: 0, w: 0, h: 0 } };

const trackConnectionPairs = () => {
  const registeredIds: ConnectionId[] = [];

  afterAll(() => {
    for (const id of registeredIds) unregisterRecord('connection', id);
  });

  return (fromId: string, from: string, toId: string, to: string, nav?: ConnectionRecord['nav']): ConnectionRecord => {
    const forward = {
      id: fromId, screenId: from, toConnectionId: toId, kind: 'edge', placement: EMPTY_PLACEMENT, canExit: true, tags: [], nav,
    } as unknown as ConnectionRecord;
    const backward = {
      id: toId, screenId: to, toConnectionId: fromId, kind: 'edge', placement: EMPTY_PLACEMENT, canExit: true, tags: [], nav,
    } as unknown as ConnectionRecord;
    for (const record of [forward, backward]) {
      if (!registerRecord('connection', record)) {
        unregisterRecord('connection', record.id);
        registerRecord('connection', record);
      }
    }
    registeredIds.push(fromId as ConnectionId, toId as ConnectionId);
    return forward;
  };
};

export { trackConnectionPairs };
