/* @layer renderer-widgets @kind logic */
/**
 * A crossing whose destination resolves to NO screen used to vanish silently
 * (`if (!to) continue`). It is the most informative finding either connection
 * `SetProbe` (`points.set.ts`, `indoor-edge.set.ts`) can produce: the game goes
 * somewhere this dataset has never catalogued. So `detectorFromStrategy`'s
 * `onUnresolvable` hook turns it into a `screen` `create` proposal, built with
 * `strategies/screen/screen-draft.ts` so it matches a screen minted by
 * `presence.set.ts`.
 *
 * An overworld destination (`kind: 'screen'`) names one real screen, so it
 * grades `certain`. A room destination (`kind: 'room'`) does not: a room number
 * alone can be a castle room or an unrelated cave (see
 * `logic/queries/game-id.ts`), and a crossing carries no palace index for its
 * destination. The proposal stays palace-less (`kind: 'interior'`) and grades
 * `likely`, with the reason naming the ambiguity. A room index of 0 is every
 * table's empty slot and not a destination, so this declines (returns null)
 * instead of fabricating one.
 */
import { gameIdLabel } from '@shared/game/logic/queries/game-id';
import type { GameScreenId } from '@shared/game/logic/queries/game-id';
import type { ScreenGameId } from '@shared/game/data';
import type { ObservedTransition } from '@shared/game/recommendations';
import type { UnresolvableMapper } from '@shared/game/recommendations/compare';
import { buildScreenDraftRecord } from '@shared/game/recommendations/strategies/screen/screen-draft';

interface CrossingIdentity {
  native: GameScreenId;
  recordGameId: ScreenGameId;
  kind: 'overworld' | 'interior';
}

const identityFor = (item: ObservedTransition): CrossingIdentity | null => {
  if (item.kind === 'screen') {
    return { native: { kind: 'overworld', screen: item.index }, recordGameId: { overworldIndex: item.index }, kind: 'overworld' };
  }
  // 0 is every room table's empty slot, never a destination.
  if (item.index === 0) return null;
  return { native: { kind: 'room', room: item.index }, recordGameId: { roomIndex: item.index }, kind: 'interior' };
};

/**
 * `UnresolvableMapper<'connection'>`'s `difference.item` is `unknown` (the engine
 * erases a `SetProbe`'s `Item` type inside a strategy's `sets`; see
 * `probe.types.ts`). The cast is safe because this mapper is registered only
 * for `connectionStrategy`, whose two set probes both declare `Item = ObservedTransition`.
 */
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
