/* @layer shared-game @kind logic */
import { actorByGameId } from '../indexes';
import type { ActorGameId, ActorRecord } from '../types';

const getActorByGameId = (match: Partial<ActorGameId>): ActorRecord | undefined => actorByGameId(match);

export { getActorByGameId };
