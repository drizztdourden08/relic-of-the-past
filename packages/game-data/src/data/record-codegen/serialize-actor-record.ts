/* @layer shared-game @kind logic */
import type { ActorRecord } from '../types';
import { ACTOR_SPEC } from './field-specs.constants';
import { recordLiteral } from './record-literal';

const serializeActorRecord = (record: ActorRecord): string => recordLiteral(record, ACTOR_SPEC);

export { serializeActorRecord };
