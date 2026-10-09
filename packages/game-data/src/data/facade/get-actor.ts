/* @layer shared-game @kind logic */
import { get } from '../registry';
import type { ActorRecord } from '../types';
import { noRecord } from './no-record';

const getActor = (id: string): ActorRecord => get('actor', id) ?? noRecord('actor', id);

export { getActor };
