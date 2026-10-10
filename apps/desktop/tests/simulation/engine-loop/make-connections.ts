/* @layer tests @kind helper */
import type { ConnectionRecord } from '@rotp/game-data';
import { registerRecord, unregisterRecord } from '@rotp/game-data';
import { EMPTY_PLACEMENT } from './engine-loop.constants';

const makeConnections = (lockBToC: boolean): ConnectionRecord[] => {
  const doorReq = lockBToC ? [['hammer']] : [];
  const records = [
    {
      id: 'connection-t01', screenId: 'A', toConnectionId: 'connection-t01r', kind: 'edge',
      placement: EMPTY_PLACEMENT, canExit: true, tags: ['transit:walk'],
    },
    {
      id: 'connection-t01r', screenId: 'B', toConnectionId: 'connection-t01', kind: 'edge',
      placement: EMPTY_PLACEMENT, canExit: true, tags: ['transit:walk'],
    },
    {
      id: 'connection-t02', screenId: 'B', toConnectionId: 'connection-t02r', kind: 'door',
      placement: EMPTY_PLACEMENT, canExit: true, tags: ['transit:door'],
      nav: { transitType: 'door', requirements: doorReq, weight: 1 },
    },
    {
      id: 'connection-t02r', screenId: 'C', toConnectionId: 'connection-t02', kind: 'door',
      placement: EMPTY_PLACEMENT, canExit: true, tags: ['transit:door'],
      nav: { transitType: 'door', requirements: doorReq, weight: 1 },
    },
  ] as unknown as ConnectionRecord[];
  for (const record of records) {
    if (!registerRecord('connection', record)) {
      unregisterRecord('connection', record.id);
      registerRecord('connection', record);
    }
  }
  return records;
};

export { makeConnections };
