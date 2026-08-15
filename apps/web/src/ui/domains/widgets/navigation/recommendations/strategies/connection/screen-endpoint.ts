/* @layer renderer-widgets @kind logic */
/**
 * Shared per-screen helpers for the connection `SetProbe`s (`points.set.ts`,
 * `indoor-edge.set.ts`): whether a `ConnectionRecord` backs a crossing LEAVING
 * the current screen, the resolved-or-sentinel key a raw transition joins on,
 * and the far-side pair check both probes suppress duplicate proposals with.
 * `screenId` is not derived here — both probes receive it from `compareSet`.
 */
import type { ConnectionRecord, ScreenId } from '@shared/game/data';
import { toScreenIdOf } from '@shared/game/data/connections/derive';
import { pairLinksScreens } from '@shared/game/data/connections/pair-join';
import type { ObservedTransition } from '@shared/game/recommendations';
import { resolveRealDestId } from '../../../connection-audit-resolve';

/**
 * A record backs a crossing LEAVING `screenId` only when it SITS on that
 * screen and can be exited. A record sits on exactly one screen, so the
 * arriving side, if auditable at all, is its OWN record on the other screen.
 */
const auditableFromHere = (screenId: ScreenId, conn: ConnectionRecord): boolean =>
  conn.screenId === screenId && conn.canExit;

/** The screen this point's partner sits on — only meaningful for a record
 *  `auditableFromHere` already accepted. */
const otherEndpoint = (_screenId: ScreenId, conn: ConnectionRecord): ScreenId => toScreenIdOf(conn);

/**
 * The resolved destination screen id, or a sentinel unique to the raw
 * `(kind, index)` pair when it does not resolve to any screen. A dataset key
 * (always a real `ScreenId`) can never collide with this sentinel, so an
 * unresolvable item can never be mistaken for "already covered".
 */
const transitionKey = (item: ObservedTransition): string =>
  resolveRealDestId(item.kind, item.index) ?? `unresolved:${item.kind}:${item.index}`;

/**
 * A stored pair already links this screen to `key`'s destination, but no
 * record in `here` (the exitable points sitting on this screen) carries it —
 * the pair covers the crossing from the far side, so proposing it again would
 * duplicate what the dataset holds. Accepted cost: a near-side `canExit: false`
 * error stays invisible instead of surfacing as a duplicate create.
 */
const storedOnFarSide = (
  screenId: ScreenId | null,
  key: string,
  all: readonly ConnectionRecord[],
  here: readonly ConnectionRecord[],
): boolean => {
  if (!screenId) return false;
  const targetId = key as ScreenId;
  return pairLinksScreens(all, screenId, targetId)
    && !here.some(c => otherEndpoint(screenId, c) === targetId);
};

export { auditableFromHere, otherEndpoint, storedOnFarSide, transitionKey };
