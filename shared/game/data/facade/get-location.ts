/* @layer shared-game @kind logic */
import { get } from '../registry';
import type { LocationRecord } from '../types';
import { noRecord } from './no-record';

const getLocation = (id: string): LocationRecord => get('location', id) ?? noRecord('location', id);

export { getLocation };
