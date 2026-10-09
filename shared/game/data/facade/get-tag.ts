/* @layer shared-game @kind logic */
import { get } from '../registry';
import type { TagRecord } from '../types';
import { noRecord } from './no-record';

const getTag = (id: string): TagRecord => get('tag', id) ?? noRecord('tag', id);

export { getTag };
