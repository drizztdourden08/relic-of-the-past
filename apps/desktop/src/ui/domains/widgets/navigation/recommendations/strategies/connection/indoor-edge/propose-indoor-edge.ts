/* @layer renderer-widgets @kind logic */
import type { ScreenId } from '@rotp/game-data';
import type { ObservedTransition } from '@rotp/game-core';
import type { ScreenObservations } from '@rotp/navigation';
import { buildConnectionRecord } from '../../../../build-connection-record';
import { resolveRealDestId } from '../../../../connection-audit-resolve';

const proposeIndoorEdge = (item: ObservedTransition, _observations: ScreenObservations, screenId: ScreenId | null) => {
  if (!screenId) return null;
  const targetId = resolveRealDestId(item.kind, item.index);
  if (!targetId) return null;
  return buildConnectionRecord({
    screenId, toScreenId: targetId, tags: ['transit:walk', 'ctx:internal'],
  });
};

export { proposeIndoorEdge };
