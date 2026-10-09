/* @layer shared-game @kind logic */
import { get } from '../registry';
import type { RegionRecord } from '../types';
import { noRecord } from './no-record';

const getRegion = (id: string): RegionRecord => get('region', id) ?? noRecord('region', id);

export { getRegion };
