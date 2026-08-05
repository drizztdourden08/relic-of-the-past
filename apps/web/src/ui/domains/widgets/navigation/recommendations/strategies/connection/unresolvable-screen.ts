/* @layer renderer-widgets @kind logic */
/**
 * Fix 2 (phase 4, part 2): a crossing whose destination resolves to NO
 * screen at all used to vanish silently (`connection-audit-core.ts`'s
 * `buildAddFindings`, deleted: `if (!to) continue`). It is the single most
 * informative finding either connection `SetProbe` (`points.set.ts`,
 * `indoor-edge.set.ts`) can produce — the game goes somewhere this dataset
 * has never catalogued — so this is wired through `detectorFromStrategy`'s
 * `onUnresolvable` hook to turn that gap into a `screen` `create` proposal
 * instead, reusing `strategies/screen/screen-draft.ts`'s builder (the same
 * one `presence.set.ts`'s F3 fix uses) so a screen minted from a crossing and
 * one minted from "the room the player is standing in" agree on shape.
 *
 * An overworld destination (`kind: 'screen'`) is unambiguous — a screen index
 * alone always names one real screen — so this grades `certain`. A room
 * destination (`kind: 'room'`) is NOT: a room number alone can be a castle
 * room or an unrelated cave (this project's own hard rule — see
 * `logic/queries/game-id.ts`), and a crossing carries no palace index for its
 * destination (we have never been there, so there is no live register
 * reading of ITS palace). Rather than guess 'dungeon' or invent a palace
 * index, the proposal stays palace-less (`kind: 'interior'`, matching
 * `presence.set.ts`'s own call for the identical uncertainty) and is graded
 * only `likely`, with the reason naming the ambiguity explicitly so a
 * reviewer knows to verify the palace before accepting. An `entrance`-kind
 * index needs the `entranceRooms` table to become a room number at all;
 * without that table read, nothing safe can be built, so this declines
 * (returns null) rather than fabricate one.
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

/** `entrance`-kind items need the entrance->room table (`entranceRooms`) to
 *  become anything at all — see the file header. */
const identityFor = (item: ObservedTransition, entranceRooms: readonly number[] | undefined): CrossingIdentity | null => {
  if (item.kind === 'screen') {
    return { native: { kind: 'overworld', screen: item.index }, recordGameId: { overworldIndex: item.index }, kind: 'overworld' };
  }
  const room = item.kind === 'room' ? item.index : entranceRooms?.[item.index];
  if (room == null || room === 0) return null;
  return { native: { kind: 'room', room }, recordGameId: { roomIndex: room }, kind: 'interior' };
};

/**
 * Typed as `UnresolvableMapper<'connection'>` — that type's `difference.item`
 * is `unknown` (the engine erases a `SetProbe`'s `Item` type once it sits in
 * a strategy's `sets` array; see `probe.types.ts`'s own comment on why). The
 * cast below is safe because THIS mapper is registered only for
 * `connectionStrategy`, whose two set probes (`points.set.ts`,
 * `indoor-edge.set.ts`) both declare `Item = ObservedTransition` — the same
 * invariant `presence.set.ts`'s probe relies on for its own single-purpose use.
 */
const onUnresolvableConnection: UnresolvableMapper<'connection'> = (difference, context) => {
  const item = difference.item as ObservedTransition;
  const identity = identityFor(item, context.observations.entranceRooms);
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
      ? `A crossing leaves this screen for room ${label}, which the dataset has never catalogued — its palace membership is unknown, so verify before accepting.`
      : `A crossing leaves this screen for ${label}, which the dataset has never catalogued.`,
    detector: 'strategy:connection',
    evidence: [{ source: 'native:room-transitions', detail: `unresolved destination ${difference.key}` }],
    confidence: ambiguous ? 'likely' : 'certain',
    screenId: context.screenId,
    origin: context.origin,
    key: `unresolved:${difference.key}`,
  };
};

export { onUnresolvableConnection };
