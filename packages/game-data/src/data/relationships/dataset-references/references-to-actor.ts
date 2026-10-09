/* @layer shared-game @kind logic */
import type { ReferenceHit } from '../reference-index.type';
import { scanReferences } from './scan-references';

const referencesToActor = (id: string): ReferenceHit[] => [
  ...scanReferences('check', 'actorId', check => check.actorId === id),
  ...scanReferences('connection', 'gatedBy', connection => connection.gatedBy === id),
  ...scanReferences('screen', 'triggerIds', screen => screen.triggerIds?.includes(id as never) ?? false),
  ...scanReferences('screen', 'spawns', screen => screen.spawns?.some(spawn => spawn.actorId === id) ?? false),
];

export { referencesToActor };
