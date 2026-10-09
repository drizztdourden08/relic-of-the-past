/* @layer shared-game @kind logic */
import { get } from '../registry';
import type { AreaRecord } from '../types';
import { noRecord } from './no-record';

const getArea = (id: string): AreaRecord => get('area', id) ?? noRecord('area', id);

export { getArea };
