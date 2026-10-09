/* @layer shared-game @kind logic */
import type { Token } from '../../types';
import type { LineAdvance } from '../types';
import { SCROLL_COMMAND } from './advance-codes.constants';

const tokenForAdvance = (advance: LineAdvance): Token | null => {
  if (advance === null) return null;
  if (advance.kind === 'row') return { t: 'break', row: advance.row };
  return { t: 'cmd', name: SCROLL_COMMAND };
};

export { tokenForAdvance };
