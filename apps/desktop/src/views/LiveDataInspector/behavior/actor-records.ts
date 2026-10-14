/* @layer renderer-widgets @kind logic */
import { getActorByGameId } from '@rotp/game-data';
import type { DetectionContext } from '@rotp/navigation';
import type { LiveRecord } from '../LiveDataInspector.type';
import { dedupeById } from './dedupe-by-id';

const actorRecords = (context: DetectionContext): readonly LiveRecord[] =>
  dedupeById((context.observations.liveSprites ?? [])
    .map(sprite => getActorByGameId({ spriteType: sprite.spriteType })));

export { actorRecords };
