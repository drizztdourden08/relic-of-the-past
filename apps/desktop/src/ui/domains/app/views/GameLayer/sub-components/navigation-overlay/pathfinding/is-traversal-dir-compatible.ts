/* @layer renderer-components @kind logic */
import { STAIRS_TRAVERSAL_STATE, TRAVERSAL_DIR_OFFSET } from '@shared/game/navigation/types/grid.constants';

const isTraversalDirCompatible = (state: number, dr: number, dc: number): boolean => {
  switch (state) {
    case TRAVERSAL_DIR_OFFSET.s: return dr === 1 && dc === 0;
    case TRAVERSAL_DIR_OFFSET.n: return dr === -1 && dc === 0;
    case TRAVERSAL_DIR_OFFSET.e: return dc === 1 && dr === 0;
    case TRAVERSAL_DIR_OFFSET.w: return dc === -1 && dr === 0;
    case TRAVERSAL_DIR_OFFSET.se: return dr === 1 || dc === 1;
    case TRAVERSAL_DIR_OFFSET.sw: return dr === 1 || dc === -1;
    case TRAVERSAL_DIR_OFFSET.ne: return dr === -1 || dc === 1;
    case TRAVERSAL_DIR_OFFSET.nw: return dr === -1 || dc === -1;
    case STAIRS_TRAVERSAL_STATE: return true;
    default: return false;
  }
};

export { isTraversalDirCompatible };
