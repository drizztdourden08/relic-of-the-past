/* @layer renderer-widgets @kind logic */
import { gameIdLabel } from '@rotp/game-data';
import type { ObservedTransition } from '@rotp/game-core';
import type { UnresolvableMapper } from '@rotp/navigation';
import { buildScreenDraftRecord } from '@rotp/navigation';
import type { CrossingIdentity } from './connection.type';
import { EMPTY_ROOM_SLOT } from './connection.constants';

const identityFor = (item: ObservedTransition): CrossingIdentity | null => {
  if (item.kind === 'screen') {
    return { native: { kind: 'overworld', screen: item.index }, recordGameId: { overworldIndex: item.index }, kind: 'overworld' };
  }
  if (item.index === EMPTY_ROOM_SLOT) return null;
  return { native: { kind: 'room', room: item.index }, recordGameId: { roomIndex: item.index }, kind: 'interior' };
};

const onUnresolvableConnection: UnresolvableMapper<'connection'> = (difference, context) => {
  const item = difference.item as ObservedTransition;
  const identity = identityFor(item);
  if (!identity) return null;

  const ambiguous = identity.kind === 'interior';
  const world = context.observations.isDarkWorld ? 'dark' : 'light';
  const label = gameIdLabel(identity.native);
  const proposed = buildScreenDraftRecord(identity.recordGameId, identity.kind, world, label);

  return {
    kind: 'screen',
    action: 'create',
    targetId: null,
    current: null,
    proposed,
    reason: ambiguous
      ? `Crossing to ${label}: no screen record, palace unknown.`
      : `Crossing to ${label}: no screen record.`,
    detector: 'strategy:connection',
    evidence: [{ source: 'native:room-transitions', detail: `unresolved destination ${difference.key}` }],
    confidence: ambiguous ? 'likely' : 'certain',
    screenId: context.screenId,
    origin: context.origin,
    key: `unresolved:${difference.key}`,
  };
};

export { onUnresolvableConnection };
