/**
 * @layer tooling-scripts
 * @kind types
 *
 * The shape of a record AS IT SITS IN THE SEED FILES — before the v8 backfill.
 * Deliberately structural and loose: the seeds were written through
 * `as unknown as X` casts, so they are not guaranteed to satisfy the real record
 * interfaces yet (that is what this migration fixes). Only the fields the
 * splitter actually reads are named; the index signature carries the rest
 * through untouched.
 */
type Loose = Record<string, unknown>;

interface SeedScreen extends Loose {
  id: string;
  gameId: { overworldIndex?: number; roomIndex?: number; palaceIndex?: number; entranceId?: number };
  kind: 'overworld' | 'dungeon' | 'interior';
  world: 'light' | 'dark';
  interiorKind?: string;
  areaId: string;
  locationId: string;
  randomizerName: string;
}

interface SeedConnection extends Loose {
  id: string;
  fromScreenId: string;
  toScreenId: string;
  direction: 'one-way' | 'two-way';
  tags: string[];
}

interface SeedCheck extends Loose {
  id: string;
  screenId?: string;
  dungeonId?: string;
  randomizerName: string;
}

interface SeedItem extends Loose {
  id: string;
  category: string;
  randomizerName: string;
}

interface SeedDungeon extends Loose {
  id: string;
  gameId: { palaceIndex?: number; bossRoomId?: number };
  randomizerName: string;
  roomScreenIds: string[];
}

interface SeedArea extends Loose {
  id: string;
  world: 'light' | 'dark' | 'both';
  randomizerName: string;
}

interface SeedLocation extends Loose {
  id: string;
  areaId: string;
  randomizerName: string;
}

/** The pre-unification actor records, one array per old kind. */
interface SeedActor extends Loose {
  id: string;
  gameId: { spriteType?: number; objectSubIndex?: number; roomTag?: number };
  vanillaName?: string;
  randomizerName: string;
  effect?: string;
}

export type {
  Loose, SeedActor, SeedArea, SeedCheck, SeedConnection, SeedDungeon, SeedItem,
  SeedLocation, SeedScreen,
};
