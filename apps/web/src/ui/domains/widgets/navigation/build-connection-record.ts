/* @layer renderer-widgets @kind logic */
/**
 * Editor state → a `ConnectionRecord` minus its id.
 *
 * `kind` and `dungeonId` are DERIVED the same way the dataset's own split
 * derived them, so an edge written from here is indistinguishable from one
 * already in the files. The tags that became a kind are retired from the tag
 * list rather than duplicated. Both endpoints must resolve to real screens —
 * an unresolved crossing comes back as null and is never written.
 *
 * A connection point ALWAYS needs a real `toConnectionId` partner (see
 * `data/connections/derive.ts`). When the destination screen already has a
 * point aimed back at `from`, this links to it directly. When it does not —
 * a genuinely brand-new crossing the game just showed the player — minting a
 * real partner id needs the allocator round trip only the write path
 * (`record-creators.ts`, via IPC to the Electron main process) can do, which
 * this in-memory proposal builder cannot reach. So it links to
 * `pendingPartnerId(to.id)` instead: a sentinel that reads unmistakably as
 * "needs a real partner minted on this screen" rather than a resolvable id.
 * `createConnection` (`record-creators.ts`) checks every accepted proposal for
 * this sentinel and, when it finds one, mints BOTH halves as a pair rather
 * than inserting this record alone — see `connection-pair-writer.ts` on the
 * main-process side. A proposal never has an unresolved endpoint any other
 * way: both `from` and `to` must already be real screens (checked below).
 */
import { findOne, pendingPartnerId, tagIdsForKeys } from '@shared/game/data';
import { toScreenIdOf } from '@shared/game/data/connections/derive';
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

/** The one dungeon both endpoints agree on, if any. */
const dungeonIdFor = (fromScreenId: ScreenId, toScreenId: ScreenId): DungeonId | undefined => {
  const of = (id: ScreenId) => findOne('dungeon', d => d.roomScreenIds.includes(id))?.id;
  const a = of(fromScreenId);
  const b = of(toScreenId);
  if (a && b) return a === b ? a : undefined;
  return a ?? b;
};

interface ConnectionDraft {
  /** The screen this point sits on. */
  screenId: string;
  /** The screen the crossing leads to — used only to FIND the existing partner point; never stored. */
  toScreenId: string;
  tags: readonly ConnectionTag[];
  nav?: ConnectionNavData;
}

const knownScreen = (id: string): ScreenRecord | undefined => findOne('screen', s => s.id === id);

/** An existing point on `toScreenId` that already names `fromScreenId` as ITS partner. */
const existingPartner = (fromScreenId: string, toScreenId: string): ConnectionRecord | undefined =>
  findOne('connection', c => c.screenId === toScreenId && toScreenIdOf(c) === fromScreenId);

const buildConnectionRecord = (draft: ConnectionDraft): PendingConnectionRecord | null => {
  const from = knownScreen(draft.screenId);
  const to = knownScreen(draft.toScreenId);
  if (!from || !to) return null;
  const partner = existingPartner(from.id, to.id);
  return {
    kind: connectionKindFor(from, to, draft.tags),
    screenId: from.id,
    toConnectionId: partner?.id ?? pendingPartnerId(to.id),
    // A proposal only ever describes a point the live game just showed the
    // player leaving from, so it can always exit — the crossing's overall
    // direction is whatever `partner.canExit` already says (see `directionOf`).
    canExit: true,
    placement: { form: 'area', rect: { x: 0, y: 0, w: 0, h: 0 }, tiles: [] },
    dungeonId: dungeonIdFor(from.id, to.id),
    // The draft carries terms; the record carries references to them.
    tags: tagIdsForKeys(draft.tags.filter(t => !RETIRED_TRANSIT.has(t))),
    nav: draft.nav,
  };
};

/** The record an existing dataset connection would be rewritten as. */
const rewriteConnectionRecord = (record: ConnectionRecord, tags: readonly ConnectionTag[]): PendingConnectionRecord | null => {
  const rebuilt = buildConnectionRecord({ screenId: record.screenId, toScreenId: toScreenIdOf(record), tags });
  if (!rebuilt) return null;
  // Fields the editor does not own are carried across untouched.
  return {
    ...rebuilt,
    gameId: record.gameId,
    placement: record.placement,
    canExit: record.canExit,
    gatedBy: record.gatedBy,
    requirements: record.requirements,
    name: record.name,
    nav: record.nav,
  };
};

export { buildConnectionRecord, connectionKindFor, dungeonIdFor, rewriteConnectionRecord };
export type { ConnectionDraft };
