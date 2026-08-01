/**
 * @layer tooling-scripts
 * @kind logic
 *
 * The v8 backfill. Every value here is DERIVED from what the seed already
 * carries — a tag, an endpoint's own geography, a native byte. Nothing is
 * invented: where the seed holds no positional data the field is simply absent.
 */
import type { Geography } from './layout';
import type { Loose, SeedActor, SeedConnection } from './seed-types';

/** `transit:*` tags that BECOME a kind and are therefore retired from tags. */
const RETIRED_TRANSIT = new Set([
  'transit:door', 'transit:stairs', 'transit:hole', 'transit:warp',
  'transit:mirror', 'transit:walk', 'transit:swim',
]);

/**
 * The demotion table, in priority order:
 *   1. a fall-through is a hole wherever it leads (including an overworld hole into a cave)
 *   2. a warp or mirror portal is a teleport
 *   3. an overworld ↔ non-overworld crossing is an entrance — that IS the kind's
 *      definition; the ctx:entrance/exit/dungeon-enter tags say the same thing
 *   4. otherwise the physical mechanism names the kind: stairs, door
 *   5. everything left is a scroll across a boundary
 * Approach tags (grave, bomb, bonk, rock, push, hookshot, ledge, waterfall)
 * never name a kind — they describe how you reach or clear the crossing.
 */
const connectionKind = (c: SeedConnection, geo: Geography): string => {
  const tag = (t: string): boolean => c.tags.includes(t);
  if (tag('transit:hole')) return 'hole';
  if (tag('transit:warp') || tag('transit:mirror')) return 'teleport';
  const from = geo.screenById.get(c.fromScreenId);
  const to = geo.screenById.get(c.toScreenId);
  if (!from || !to) throw new Error(`connection ${c.id} has an unknown endpoint`);
  const ctxThreshold = tag('ctx:entrance') || tag('ctx:exit') || tag('ctx:dungeon-enter');
  const geoThreshold = (from.kind === 'overworld') !== (to.kind === 'overworld');
  if (ctxThreshold || geoThreshold) return 'entrance';
  if (tag('transit:stairs')) return 'stairs';
  if (tag('transit:door')) return 'door';
  return 'edge';
};

const keptTags = (tags: readonly string[]): string[] => tags.filter(t => !RETIRED_TRANSIT.has(t));

/**
 * Placement comes from the side/tileRange pair the flood engine produces. The
 * seeds carry neither, so this returns undefined for every current record —
 * an absent placement, never a fabricated coordinate.
 */
const placementOf = (c: SeedConnection): Loose | undefined => {
  const side = c.side as string | undefined;
  if (side === undefined) return undefined;
  const tileRange = c.tileRange as Loose | undefined;
  return tileRange ? { at: 'side', side, tileRange } : { at: 'side', side };
};

/** The one dungeon both endpoints agree on, if any. */
const dungeonIdOf = (c: SeedConnection, geo: Geography): string | undefined => {
  const a = geo.dungeonIdByScreen.get(c.fromScreenId);
  const b = geo.dungeonIdByScreen.get(c.toScreenId);
  if (a && b) return a === b ? a : undefined;
  return a ?? b;
};

/**
 * Counterparts pair a crossing with its true reverse: same two screens, opposite
 * direction, SAME mechanism, and unique on both sides. A pit down and a
 * staircase back up are two different crossings, not counterparts, so they stay
 * unpaired — as do self-loops and genuine one-ways (ledge drops, fall holes).
 */
const counterparts = (connections: readonly SeedConnection[], kindOf: (c: SeedConnection) => string): Map<string, string> => {
  const byDirection = new Map<string, SeedConnection[]>();
  for (const c of connections) {
    const key = `${c.fromScreenId}>${c.toScreenId}`;
    const bucket = byDirection.get(key);
    if (bucket) bucket.push(c); else byDirection.set(key, [c]);
  }
  const sameKind = (key: string, kind: string): SeedConnection[] =>
    (byDirection.get(key) ?? []).filter(x => kindOf(x) === kind);

  const pairs = new Map<string, string>();
  for (const c of connections) {
    if (c.fromScreenId === c.toScreenId) continue;
    const kind = kindOf(c);
    const mine = sameKind(`${c.fromScreenId}>${c.toScreenId}`, kind);
    const mirror = sameKind(`${c.toScreenId}>${c.fromScreenId}`, kind);
    if (mine.length === 1 && mirror.length === 1) pairs.set(c.id, mirror[0].id);
  }
  return pairs;
};

const ACTOR_KIND_ORDER = ['enemy', 'boss', 'npc', 'object', 'obstacle', 'trigger'];

const nativeValue = (gameId: SeedActor['gameId']): number =>
  gameId.spriteType ?? gameId.roomTag ?? gameId.objectSubIndex ?? Number.MAX_SAFE_INTEGER;

interface ActorRow {
  record: Loose;
  oldId: string;
}

/**
 * One-time freeze of the `actor` id namespace: the npc / obstacle / trigger
 * records sorted by kind, then by their native spriteType / roomTag /
 * objectSubIndex ascending, then by their old id. Nothing referenced the old
 * ids, so this is the first and only assignment.
 */
const unifyActors = (groups: readonly { kind: string; records: readonly SeedActor[] }[], makeId: (n: number) => string): ActorRow[] => {
  const rows = groups.flatMap(g => g.records.map(r => ({ kind: g.kind, old: r })));
  for (const row of rows) {
    const carried = Object.keys(row.old).filter(k => !['id', 'gameId', 'randomizerName', 'vanillaName', 'effect'].includes(k));
    if (carried.length) throw new Error(`actor ${row.old.id} carries unmapped field(s): ${carried.join(', ')}`);
  }
  rows.sort((x, y) => {
    const byKind = ACTOR_KIND_ORDER.indexOf(x.kind) - ACTOR_KIND_ORDER.indexOf(y.kind);
    if (byKind !== 0) return byKind;
    const byNative = nativeValue(x.old.gameId) - nativeValue(y.old.gameId);
    if (byNative !== 0) return byNative;
    return x.old.id.localeCompare(y.old.id);
  });
  return rows.map((row, index) => ({
    oldId: row.old.id,
    record: {
      id: makeId(index + 1),
      gameId: row.old.gameId,
      kind: row.kind,
      vanillaName: row.old.vanillaName,
      randomizerName: row.old.randomizerName,
      effect: row.old.effect,
    },
  }));
};

export {
  ACTOR_KIND_ORDER, connectionKind, counterparts, dungeonIdOf, keptTags,
  nativeValue, placementOf, RETIRED_TRANSIT, unifyActors,
};
export type { ActorRow };
