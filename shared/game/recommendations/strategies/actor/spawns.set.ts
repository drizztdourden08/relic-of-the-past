/* @layer shared-game @kind logic */
import { all } from '../../../data';
import type { ActorRecord } from '../../../data';
import { unread } from '../../compare/probe-reading';
import type { Probe, SetProbe } from '../../compare/probe.type';
import type { LiveSpriteObservation, ScreenObservations } from '../../detection-types';
import { profileFrom } from './combat-profile';
import type { UncataloguedSpawn } from './spawns.set.type';

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
  if (!liveSprites) return unread();
  const value = distinctSpawnTypes(liveSprites).map(spriteType => ({ spriteType, combat: spriteCombat?.[spriteType] }));
  return { known: true, value };
};

const readDataset = (): readonly ActorRecord[] => all('actor').filter(actor => actor.gameId.spriteType != null);

const liveKey = (item: UncataloguedSpawn): string => String(item.spriteType);

const datasetKey = (record: ActorRecord): string => String(record.gameId.spriteType);

const toProposed = (item: UncataloguedSpawn): Omit<ActorRecord, 'id'> => ({
  gameId: { spriteType: item.spriteType },
  kind: item.combat ? 'enemy' : 'object',
  ...(item.combat ? { combat: profileFrom(item.combat) } : {}),
});

const actorSpawnsProbe: SetProbe<'actor', UncataloguedSpawn> = {
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

export { actorSpawnsProbe };
export type { UncataloguedSpawn } from './spawns.set.type';
