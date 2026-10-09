/* @layer shared-game @kind logic */
import { get } from '../registry';
import type { ConnectionRecord } from '../types';
import { noRecord } from './no-record';

const getConnection = (id: string): ConnectionRecord => get('connection', id) ?? noRecord('connection', id);

export { getConnection };
