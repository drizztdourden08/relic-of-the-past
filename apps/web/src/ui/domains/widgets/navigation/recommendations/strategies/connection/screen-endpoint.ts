/* @layer renderer-widgets @kind logic */
/**
 * Shared per-screen helpers for the connection `SetProbe`s (`points.set.ts`,
 * `indoor-edge.set.ts`): whether a `ConnectionRecord` backs a crossing
 * LEAVING the current screen, and the resolved-or-sentinel key a raw
 * transition index joins on. Both probes receive `screenId` straight from
 * `compareSet` (see `probe.types.ts`), sourced from `context.screenId`.
 */
import type { ConnectionRecord, ScreenId } from '@shared/game/data';
import { toScreenIdOf } from '@shared/game/data/connections/derive';
import type { ObservedTransition } from '@shared/game/recommendations';
import { resolveRealDestId } from '../../../connection-audit-resolve';

/**
 * A record backs a crossing LEAVING `screenId` only when it SITS on that
 * screen and can be exited. A record sits on exactly one screen, so there is
 * no reverse-endpoint case: the arriving side is its OWN record on the other screen.
 */
const auditableFromHere = (screenId: ScreenId, conn: ConnectionRecord): boolean =>
  conn.screenId === screenId && conn.canExit;

/** The screen this point's partner sits on. Only meaningful for a record
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

export { auditableFromHere, otherEndpoint, transitionKey };
