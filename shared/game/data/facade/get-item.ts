/* @layer shared-game @kind logic */
import { get } from '../registry';
import type { ItemRecord } from '../types';
import { noRecord } from './no-record';

const getItem = (id: string): ItemRecord => get('item', id) ?? noRecord('item', id);

export { getItem };
