/* @layer renderer-widgets @kind logic */
import type { ScreenId } from '@rotp/game-data';
import { buildConnectionNav } from '@rotp/navigation';
import type { ObservedTransition } from '@rotp/game-core';
import type { ScreenObservations } from '@rotp/navigation';
import { buildConnectionRecord } from '../../../../build-connection-record';
import { resolveRealDestId } from '../../../../connection-audit-resolve';
import { findFloodForTarget } from '../../../../connection-tile-display';
import { inferTags } from './infer-tags';

const proposePoint = (item: ObservedTransition, observations: ScreenObservations, screenId: ScreenId | null) => {
  if (!screenId) return null;
  const targetId = resolveRealDestId(item.kind, item.index);
  if (!targetId) return null;
  const tags = inferTags(item);
  const info = findFloodForTarget([...observations.floodConnections], targetId);
  const nav = info ? buildConnectionNav(info, tags) : undefined;
  return buildConnectionRecord({ screenId, toScreenId: targetId, tags, nav });
};

export { proposePoint };
