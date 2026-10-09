/* @layer shared-game @kind logic */
import { getActorByGameId } from '@rotp/game-data';
import type { ActorId, ScreenRecord, ScreenSpawn } from '@rotp/game-data';
import { known, unread } from '../../compare/probe-reading';
import type { FieldProbe, Probe } from '../../compare/probe.type';
import type { LiveSpriteObservation } from '@rotp/game-core';
import type { ScreenObservations } from '../../detection-types/detection.type';
import { isCurrentScreen } from './is-current-screen';

const spawnKey = (actorId: ActorId, tile: { x: number; y: number }): string => `${actorId}@${tile.x},${tile.y}`;

const resolvedLiveSpawns = (liveSprites: readonly LiveSpriteObservation[]): ScreenSpawn[] => {
  const out: ScreenSpawn[] = [];
  for (const sprite of liveSprites) {
    const actor = getActorByGameId({ spriteType: sprite.spriteType });
    if (!actor) continue;
    out.push({ actorId: actor.id, tile: { x: sprite.col, y: sprite.row } });
  }
  return out;
};

const unionSpawns = (current: readonly ScreenSpawn[], liveSprites: readonly LiveSpriteObservation[]): ScreenSpawn[] => {
  const seen = new Set(current.map(spawn => spawnKey(spawn.actorId, spawn.tile)));
  const merged = [...current];
  for (const spawn of resolvedLiveSpawns(liveSprites)) {
    const key = spawnKey(spawn.actorId, spawn.tile);
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(spawn);
  }
  return merged;
};

const readSpawns = (observations: ScreenObservations, record: ScreenRecord): Probe<unknown> => {
  const { liveSprites } = observations;
  if (!liveSprites) return unread();
  const merged = unionSpawns(record.spawns ?? [], liveSprites);
  return known(merged.length > 0 ? merged : undefined);
};

const spawnsProbe: FieldProbe<'screen'> = {
  path: 'spawns',
  label: 'Spawns',
  source: 'native:sprite-spawns',
  confidence: 'certain',
  applies: (observations, record) => isCurrentScreen(observations, record),
  read: readSpawns,
};

export { spawnsProbe };
