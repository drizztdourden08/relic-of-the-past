/* @layer renderer-widgets @kind logic */
/**
 * Editor state → a `ConnectionRecord` minus its id.
 *
 * `kind`, `direction` and `dungeonId` are DERIVED the same way the dataset's own
 * split derived them, so an edge written from here is indistinguishable from one
 * already in the files. The tags that became a kind are retired from the tag list
 * rather than duplicated. Both endpoints must resolve to real screens — an
 * unresolved crossing comes back as null and is never written.
 */
import { findOne, tagIdsForKeys } from '@shared/game/data';
import type {
  ConnectionKind, ConnectionRecord, ConnectionTag, DungeonId, ScreenId, ScreenRecord,
} from '@shared/game/data';
import type { PendingConnectionRecord } from '@shared/game/data/record-codegen';
import type { ConnectionNavData } from '@shared/game/navigation';

/** `transit:*` tags that BECAME a kind, and are therefore retired from tags. */
const RETIRED_TRANSIT: ReadonlySet<ConnectionTag> = new Set<ConnectionTag>([
  'transit:door', 'transit:stairs', 'transit:hole', 'transit:warp',
  'transit:mirror', 'transit:walk', 'transit:swim',
]);

/**
 * The demotion table, in priority order:
 *   1. a fall-through is a hole wherever it leads
 *   2. a warp or portal is a teleport
 *   3. an overworld ↔ non-overworld crossing is an entrance — that IS the kind's
 *      definition, and the ctx:entrance/exit/dungeon-enter tags say the same
 *   4. otherwise the physical mechanism names the kind: stairs, door
 *   5. everything left is a scroll across a boundary
 * Approach tags (grave, bomb, bonk, rock, push, hookshot, ledge, waterfall) never
 * name a kind — they describe how you reach or clear the crossing.
 */
const connectionKindFor = (from: ScreenRecord, to: ScreenRecord, tags: readonly ConnectionTag[]): ConnectionKind => {
  const has = (t: ConnectionTag): boolean => tags.includes(t);
  if (has('transit:hole')) return 'hole';
  if (has('transit:warp') || has('transit:mirror')) return 'teleport';
  const ctxThreshold = has('ctx:entrance') || has('ctx:exit') || has('ctx:dungeon-enter');
  if (ctxThreshold || (from.kind === 'overworld') !== (to.kind === 'overworld')) return 'entrance';
  if (has('transit:stairs')) return 'stairs';
  if (has('transit:door')) return 'door';
  return 'edge';
};

const directionFor = (tags: readonly ConnectionTag[]): ConnectionRecord['direction'] =>
  (tags.includes('dir:one-way') ? 'one-way' : 'two-way');

/** The one dungeon both endpoints agree on, if any. */
const dungeonIdFor = (fromScreenId: ScreenId, toScreenId: ScreenId): DungeonId | undefined => {
  const of = (id: ScreenId) => findOne('dungeon', d => d.roomScreenIds.includes(id))?.id;
  const a = of(fromScreenId);
  const b = of(toScreenId);
  if (a && b) return a === b ? a : undefined;
  return a ?? b;
};

interface ConnectionDraft {
  fromScreenId: string;
  toScreenId: string;
  tags: readonly ConnectionTag[];
  nav?: ConnectionNavData;
}

const knownScreen = (id: string): ScreenRecord | undefined => findOne('screen', s => s.id === id);

const buildConnectionRecord = (draft: ConnectionDraft): PendingConnectionRecord | null => {
  const from = knownScreen(draft.fromScreenId);
  const to = knownScreen(draft.toScreenId);
  if (!from || !to) return null;
  return {
    kind: connectionKindFor(from, to, draft.tags),
    fromScreenId: from.id,
    toScreenId: to.id,
    direction: directionFor(draft.tags),
    dungeonId: dungeonIdFor(from.id, to.id),
    // The draft carries terms; the record carries references to them.
    tags: tagIdsForKeys(draft.tags.filter(t => !RETIRED_TRANSIT.has(t))),
    nav: draft.nav,
  };
};

/** The record an existing dataset connection would be rewritten as. */
const rewriteConnectionRecord = (record: ConnectionRecord, tags: readonly ConnectionTag[]): PendingConnectionRecord | null => {
  const rebuilt = buildConnectionRecord({ fromScreenId: record.fromScreenId, toScreenId: record.toScreenId, tags });
  if (!rebuilt) return null;
  // Fields the editor does not own are carried across untouched.
  return {
    ...rebuilt,
    gameId: record.gameId,
    placement: record.placement,
    counterpartId: record.counterpartId,
    gatedBy: record.gatedBy,
    requirements: record.requirements,
    name: record.name,
    nav: record.nav,
  };
};

export { buildConnectionRecord, connectionKindFor, directionFor, dungeonIdFor, rewriteConnectionRecord };
export type { ConnectionDraft };
