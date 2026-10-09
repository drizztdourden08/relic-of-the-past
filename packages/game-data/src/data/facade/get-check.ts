/* @layer shared-game @kind logic */
import { get } from '../registry';
import type { CheckRecord } from '../types';
import { noRecord } from './no-record';

const getCheck = (id: string): CheckRecord => get('check', id) ?? noRecord('check', id);

export { getCheck };
