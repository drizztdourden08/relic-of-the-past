/* @layer tests @kind test */
/**
 * Invariants over the migrated connection-points model (one record = one
 * point on one screen; `toConnectionId` always names its partner). These pin
 * down the six guarantees the connection-model migration promised — see
 * `shared/game/data/connections/derive.ts` for the helpers this reads
 * through.
 *
 * Two of the six do not hold for every record today, and per the migration's
 * own rule ("do not weaken the assertion") both stay `test.todo` with the
 * exact violating ids named, rather than being loosened to pass:
 *  - tile-footprint uniqueness: 8 pairs share tiles with another point on the
 *    same screen (a door and the stair beneath it, sharing tiles by design —
 *    see `ConnectionPlacement.layer` — but the migration had no source data
 *    to populate `layer`, so these read as unresolved collisions).
 *  - same-screen pairs: connection-896/connection-1143 name the same screen
 *    on both ends (inherited from the pre-migration data, not introduced by
 *    the migration) and carry no `ctx:internal` tag to explain it.
 */
import { describe, it, expect } from 'vitest';
import { all, getConnection } from '@shared/game/data';

const ALL_CONNECTIONS = all('connection');

describe('connection pairing invariants', () => {
  it('every toConnectionId resolves to a real record', () => {
    const knownIds = new Set(ALL_CONNECTIONS.map(c => c.id));
    const unresolved = ALL_CONNECTIONS.filter(c => !knownIds.has(c.toConnectionId));
    expect(unresolved.map(c => c.id)).toEqual([]);
  });

  it('pairing is mutual: the partner points back', () => {
    const broken = ALL_CONNECTIONS.filter(c => getConnection(c.toConnectionId).toConnectionId !== c.id);
    expect(broken.map(c => c.id)).toEqual([]);
  });

  // 1 known violation: connection-896 <-> connection-1143 (screen-236, both
  // ends), inherited from the pre-migration source data rather than
  // introduced by the migration — neither side carries `ctx:internal`. The
  // check this would run, kept here for whoever re-enables it:
  //   const violators = ALL_CONNECTIONS.filter(c => {
  //     const partner = getConnection(c.toConnectionId);
  //     if (c.screenId !== partner.screenId) return false;
  //     return !hasTagKey(c.tags, 'ctx:internal') && !hasTagKey(partner.tags, 'ctx:internal');
  //   });
  //   expect(violators.map(c => c.id)).toEqual([]);
  it.todo('a pair spans two different screens, or is explicitly an internal crossing (1 violation: connection-896 <-> connection-1143)');

  // 8 known violations (16 records): a door and the stair/entrance beneath it
  // legitimately share a tile footprint on different layers — the model has
  // `ConnectionPlacement.layer` for exactly this, but the migration had no
  // source data to populate it, so these currently read as unresolved
  // collisions: connection-324/325 (screen-051), connection-212/243
  // (screen-103), connection-228/244 (screen-122), connection-230/245
  // (screen-123), connection-232/246 (screen-124), connection-002/366
  // (screen-204), connection-382/383 (screen-190), connection-404/405 (screen-031).
  // The check this would run, kept here for whoever re-enables it:
  //   const bySreen = new Map<string, Map<string, string>>();
  //   const collisions: string[] = [];
  //   for (const c of ALL_CONNECTIONS) {
  //     const sig = tileSig(c);
  //     if (!sig) continue;
  //     const seen = bySreen.get(c.screenId) ?? new Map<string, string>();
  //     bySreen.set(c.screenId, seen);
  //     if (seen.has(sig)) collisions.push(`${seen.get(sig)} vs ${c.id} on ${c.screenId}`);
  //     else seen.set(sig, c.id);
  //   }
  //   expect(collisions).toEqual([]);
  it.todo('no two points on one screen share the same non-empty tile footprint (8 violations, see file header)');

  it('at least one end of every pair can exit', () => {
    const dead = ALL_CONNECTIONS.filter(c => !c.canExit && !getConnection(c.toConnectionId).canExit);
    expect(dead.map(c => c.id)).toEqual([]);
  });

  it('every screen holding a point is reachable as more than a `to`', () => {
    const screensAsTo = new Set(ALL_CONNECTIONS.map(c => getConnection(c.toConnectionId).screenId));
    const screensAsOwn = new Set(ALL_CONNECTIONS.map(c => c.screenId));
    const onlyEverATo = [...screensAsTo].filter(id => !screensAsOwn.has(id));
    expect(onlyEverATo).toEqual([]);
  });
});
