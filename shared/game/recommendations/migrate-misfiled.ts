/* @layer shared-game @kind logic */
/**
 * Relocating an entry stored under a collection it is not about.
 *
 * A finding is DECIDED under `entry.kind` (see `store.ts`'s `decide`, which the
 * renderer calls with the entry's own kind), so an entry sitting in another
 * kind's file is unreachable by any verdict: accepting it writes the decision
 * to a file the entry is not in, and the untouched original keeps reading as
 * open. Worse, once a pass files that same content-derived id correctly, BOTH
 * copies exist and the flattened read shows the finding twice — one decided,
 * one open, resurrecting itself forever.
 *
 * So this is a repair, run once over the stored files before anything reads
 * them: every entry ends up in its own kind's file, and no id survives in two.
 * On a collision the DECIDED copy wins — a person's verdict is the one piece of
 * state nothing here is allowed to discard — and a tie keeps the copy already
 * in the destination, whose `firstSeenAt` is the older of the two.
 */
import type { EntityKind } from '../data/types';
import type { Recommendation } from './types';
import type { RecommendationStorage } from './store';

const isDecided = (entry: Recommendation): boolean =>
  entry.state === 'accepted' || entry.state === 'dismissed';

const preferred = (existing: Recommendation, arriving: Recommendation): Recommendation =>
  (!isDecided(existing) && isDecided(arriving) ? arriving : existing);

interface MisfiledSplit {
  kept: Recommendation[];
  moved: Map<EntityKind, Recommendation[]>;
}

const splitByOwnKind = (kind: EntityKind, entries: readonly Recommendation[]): MisfiledSplit => {
  const kept: Recommendation[] = [];
  const moved = new Map<EntityKind, Recommendation[]>();
  for (const entry of entries) {
    if (entry.kind === kind) { kept.push(entry); continue; }
    const group = moved.get(entry.kind) ?? [];
    group.push(entry);
    moved.set(entry.kind, group);
  }
  return { kept, moved };
};

const mergeIn = (
  current: readonly Recommendation[],
  arrivals: readonly Recommendation[],
): Recommendation[] => {
  const byId = new Map(current.map(entry => [entry.id, entry] as const));
  for (const arrival of arrivals) {
    const existing = byId.get(arrival.id);
    byId.set(arrival.id, existing ? preferred(existing, arrival) : arrival);
  }
  return [...byId.values()];
};

/**
 * Repairs every collection in `kinds`, writing only the files that changed.
 * Returns how many entries were relocated, so a host can stay silent when
 * there was nothing to do.
 */
const migrateMisfiledEntries = async (
  storage: RecommendationStorage,
  kinds: readonly EntityKind[],
): Promise<number> => {
  const pending = new Map<EntityKind, Recommendation[]>();
  const arrivals = new Map<EntityKind, Recommendation[]>();
  let relocated = 0;

  for (const kind of kinds) {
    const entries = await storage.load(kind);
    const split = splitByOwnKind(kind, entries);
    if (split.kept.length === entries.length) continue;
    relocated += entries.length - split.kept.length;
    pending.set(kind, split.kept);
    for (const [destination, group] of split.moved) {
      arrivals.set(destination, [...(arrivals.get(destination) ?? []), ...group]);
    }
  }

  if (relocated === 0) return 0;

  for (const [kind, group] of arrivals) {
    // A destination is not necessarily among the files trimmed above, so its
    // current contents are read here rather than assumed.
    const current = pending.get(kind) ?? [...await storage.load(kind)];
    pending.set(kind, mergeIn(current, group));
  }

  for (const [kind, entries] of pending) await storage.save(kind, entries);
  return relocated;
};

export { migrateMisfiledEntries };
