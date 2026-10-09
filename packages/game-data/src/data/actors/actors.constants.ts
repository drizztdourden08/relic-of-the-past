/* @layer shared-game @kind constants */
import { recordsIn } from '../registry';
import type { ActorRecord } from '../types';

const files = import.meta.glob('../records/actors/*.ts', { eager: true });

const ALL_ACTORS: ActorRecord[] = recordsIn<ActorRecord>(files);

export { ALL_ACTORS };
