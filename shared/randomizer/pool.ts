/* @layer shared-game @kind logic */
/**
 * Builds the randomizer's item pool and open-check list from the dataset
 * facade. Conservation invariant: |poolItemIds| === |checks| — the pool is
 * exactly the multiset of first vanilla items of the included checks.
 */
import { all, getItem } from '@shared/game/data';
import type { CheckRecord, ItemRecord } from '@shared/game/data';
import type { RandomizerOptions } from './placement.type';

/** Forward-compat: a review field may be stamped on check records later. */
type Reviewable = { review?: string };

interface ExcludedCheck {
  checkId: string;
  reason: string;
}

interface PoolResult {
  checks: CheckRecord[];
  poolItemIds: string[];
  excluded: ExcludedCheck[];
}

type ItemClass = 'progression' | 'useful' | 'junk';

const PROGRESSION_CATEGORIES: ReadonlySet<string> = new Set(['weapon', 'equipment', 'medallion', 'key', 'crystal', 'bottle']);
const JUNK_CATEGORIES: ReadonlySet<string> = new Set(['junk', 'upgrade']);

/** Resolves an item to a grantable record — itself, or its alias target (one hop) — requiring a native receive index. */
const resolveReceivable = (itemId: string): ItemRecord | null => {
  const record = getItem(itemId);
  if (record.gameId?.receiveItemId !== undefined) return record;
  if (record.aliasOf !== undefined) {
    const target = getItem(record.aliasOf);
    if (target.gameId?.receiveItemId !== undefined) return target;
  }
  return null;
};

const buildPool = (options: RandomizerOptions): PoolResult => {
  const kinds: readonly string[] = options.randomizedKinds;
  const checks: CheckRecord[] = [];
  const poolItemIds: string[] = [];
  const excluded: ExcludedCheck[] = [];

  for (const check of all('check')) {
    if (!kinds.includes(check.kind)) continue;
    if ((check as CheckRecord & Reviewable).review === 'needs-work') {
      excluded.push({ checkId: check.id, reason: 'review-needs-work' });
      continue;
    }
    const firstItemId = check.vanillaItemIds[0];
    if (firstItemId === undefined) {
      excluded.push({ checkId: check.id, reason: 'no-vanilla-item' });
      continue;
    }
    if (resolveReceivable(firstItemId) === null) {
      excluded.push({ checkId: check.id, reason: 'no-receive-item-id' });
      continue;
    }
    checks.push(check);
    poolItemIds.push(firstItemId);
  }

  return { checks, poolItemIds, excluded };
};

const classifyItem = (itemId: string): ItemClass => {
  const { category } = getItem(itemId);
  if (PROGRESSION_CATEGORIES.has(category)) return 'progression';
  if (JUNK_CATEGORIES.has(category)) return 'junk';
  return 'useful';
};

const isProgressionItem = (itemId: string): boolean => classifyItem(itemId) === 'progression';

/**
 * Pool items bound to a dungeon (keys, big keys, maps, compasses) grouped by
 * their dungeon id — a later fill step must place these only inside their own
 * dungeon.
 */
const dungeonLocalItems = (checks: readonly CheckRecord[]): Map<string, string[]> => {
  const byDungeon = new Map<string, string[]>();
  for (const check of checks) {
    const itemId = check.vanillaItemIds[0];
    if (itemId === undefined) continue;
    const { dungeonId } = getItem(itemId);
    if (dungeonId === undefined) continue;
    const list = byDungeon.get(dungeonId) ?? [];
    list.push(itemId);
    byDungeon.set(dungeonId, list);
  }
  return byDungeon;
};

export { buildPool, classifyItem, dungeonLocalItems, isProgressionItem };
export type { ExcludedCheck, ItemClass, PoolResult };
