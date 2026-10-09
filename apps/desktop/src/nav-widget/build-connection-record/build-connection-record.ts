/* @layer renderer-widgets @kind logic */
import { findOne, pendingPartnerId, tagIdsForKeys } from '@rotp/game-data';
import { toScreenIdOf } from '@rotp/game-data';
import type { ConnectionRecord, ScreenRecord } from '@rotp/game-data';
import type { PendingConnectionRecord } from '@rotp/game-data';
import type { ConnectionDraft } from '../../views/NavigationWidget/NavigationWidget.type';
import { connectionKindFor } from './connection-kind-for';
import { dungeonIdFor } from './dungeon-id-for';
import { RETIRED_TRANSIT } from './build-connection-record.constants';

const knownScreen = (id: string): ScreenRecord | undefined => findOne('screen', s => s.id === id);

const existingPartner = (fromScreenId: string, toScreenId: string): ConnectionRecord | undefined =>
  findOne('connection', c => c.screenId === toScreenId && toScreenIdOf(c) === fromScreenId);

const buildConnectionRecord = (draft: ConnectionDraft): PendingConnectionRecord | null => {
  const from = knownScreen(draft.screenId);
  const to = knownScreen(draft.toScreenId);
  if (!from || !to) return null;
  const partner = existingPartner(from.id, to.id);
  return {
    kind: connectionKindFor(from, to, draft.tags),
    screenId: from.id,
    toConnectionId: partner?.id ?? pendingPartnerId(to.id),
    canExit: true,
    placement: { form: 'area', rect: { x: 0, y: 0, w: 0, h: 0 }, tiles: [] },
    dungeonId: dungeonIdFor(from.id, to.id),
    tags: tagIdsForKeys(draft.tags.filter(t => !RETIRED_TRANSIT.has(t))),
    nav: draft.nav,
  };
};

export { buildConnectionRecord };
