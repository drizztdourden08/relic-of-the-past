/* @layer shared-game @kind logic */
import type { ActorKind } from '../types';
import type { FileTarget } from './record-file-targets.type';
import { ACTOR_KIND_FILES } from './collection-files.constants';

const actorRecordFile = (actor: { kind: ActorKind }): FileTarget => {
  const file = ACTOR_KIND_FILES[actor.kind];
  return file
    ? { relativePath: `actors/${file}.ts` }
    : { relativePath: null, unresolved: `no file is declared for ${actor.kind} actors` };
};

export { actorRecordFile };
