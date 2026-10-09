/* @layer shared-game @kind logic */
import { get } from '../registry';
import type { ScreenRecord } from '../types';
import { noRecord } from './no-record';

const getScreen = (id: string): ScreenRecord => get('screen', id) ?? noRecord('screen', id);

export { getScreen };
