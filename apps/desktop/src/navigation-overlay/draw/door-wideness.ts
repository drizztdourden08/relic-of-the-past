/* @layer renderer-components @kind logic */
import type { ScreenAnnotation } from '@rotp/navigation';
import { DOOR_KINDS } from './draw.constants';

const doorWideness = (a: ScreenAnnotation): { wideCols: boolean; wideRows: boolean } => {
  const isDoor = DOOR_KINDS.has(a.kind);
  return {
    wideCols: isDoor && (a.direction === 'n' || a.direction === 's'),
    wideRows: isDoor && (a.direction === 'e' || a.direction === 'w'),
  };
};

export { doorWideness };
