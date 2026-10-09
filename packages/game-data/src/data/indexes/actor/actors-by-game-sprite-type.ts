/* @layer shared-game @kind logic */
import type { ActorRecord } from '../../types';
import { actorIndexMaps } from './actor-index-maps';

const actorsByGameSpriteType = (spriteType: number): ActorRecord[] => (
  actorIndexMaps.allBySpriteType.get(spriteType) ?? []
);

export { actorsByGameSpriteType };
