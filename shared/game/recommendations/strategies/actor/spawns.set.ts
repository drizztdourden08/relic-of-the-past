/* @layer shared-game @kind data */
/**
 * A live sprite spawn with no `ActorRecord` cataloguing its sprite type.
 *
 * The spawn table for the loaded room is fully enumerable, so a spawn no
 * record's `gameId.spriteType` names is a proven gap: `certain`. The actor's
 * `kind` is NOT provable from the spawn byte, so this proposes `'enemy'` only
 * when a native combat row proves the sprite fights, and `'object'` (the
 * dataset's catch-all) otherwise. A human still reviews the proposal.
 *
 * `removable: false`: the per-room table only proves what THIS room spawns,
 * never that some OTHER catalogued actor is wrong to exist.
 */
import { all } from '../../../data';
import type { ActorRecord } from '../../../data';
import { unread } from '../../compare/probe-helpers';
import type { Probe, SetProbe } from '../../compare/probe.types';
import type { LiveSpriteObservation, ScreenObservations, SpriteCombatObservation } from '../../detection-types';
import { profileFrom } from './combat-profile';

interface UncataloguedSpawn { spriteType: number; combat?: SpriteCombatObservation }

/** One entry per distinct spawned sprite type, because repeat spawns of the same
 *  type on one screen collapse into a single live item. */
const distinctSpawnTypes = (spawns: readonly LiveSpriteObservation[]): number[] => {
  const seen = new Set<number>();
  const out: number[] = [];
  for (const spawn of spawns) {
    if (seen.has(spawn.spriteType)) continue;
    seen.add(spawn.spriteType);
    out.push(spawn.spriteType);
  }
  return out;
};

const readLive = (observations: ScreenObservations): Probe<readonly UncataloguedSpawn[]> => {
  const { liveSprites, spriteCombat } = observations;
  // Absent means "not read", never "nothing spawns here".
  if (!liveSprites) return unread();
  const value = distinctSpawnTypes(liveSprites).map(spriteType => ({ spriteType, combat: spriteCombat?.[spriteType] }));
  return { known: true, value };
};

const readDataset = (): readonly ActorRecord[] => all('actor').filter(actor => actor.gameId.spriteType != null);

const liveKey = (item: UncataloguedSpawn): string => String(item.spriteType);

const datasetKey = (record: ActorRecord): string => String(record.gameId.spriteType);

const toProposed = (item: UncataloguedSpawn): Omit<ActorRecord, 'id'> => ({
  gameId: { spriteType: item.spriteType },
  // 'enemy' only when a native combat row proves the sprite fights, 'object'
  // otherwise. Never a name-level guess like 'npc'/'boss'. See file header.
  kind: item.combat ? 'enemy' : 'object',
  ...(item.combat ? { combat: profileFrom(item.combat) } : {}),
});

const ACTOR_SPAWNS_PROBE: SetProbe<'actor', UncataloguedSpawn> = {
  id: 'actor-spawns',
  noun: 'spawn',
  readLive,
  readDataset,
  liveKey,
  datasetKey,
  toProposed,
  removable: false,
  source: 'native:sprite-spawns',
  confidence: 'certain',
};

export { ACTOR_SPAWNS_PROBE };
export type { UncataloguedSpawn };
