/* @layer renderer-components @kind logic */
import { STAIRS_TRAVERSAL_STATE, TRAVERSAL_DIR_OFFSET } from '@rotp/navigation';

const dirRules = new Map<number, (dr: number, dc: number) => boolean>([
  [TRAVERSAL_DIR_OFFSET.s, (dr, dc) => dr === 1 && dc === 0],
  [TRAVERSAL_DIR_OFFSET.n, (dr, dc) => dr === -1 && dc === 0],
  [TRAVERSAL_DIR_OFFSET.e, (dr, dc) => dc === 1 && dr === 0],
  [TRAVERSAL_DIR_OFFSET.w, (dr, dc) => dc === -1 && dr === 0],
  [TRAVERSAL_DIR_OFFSET.se, (dr, dc) => dr === 1 || dc === 1],
  [TRAVERSAL_DIR_OFFSET.sw, (dr, dc) => dr === 1 || dc === -1],
  [TRAVERSAL_DIR_OFFSET.ne, (dr, dc) => dr === -1 || dc === 1],
  [TRAVERSAL_DIR_OFFSET.nw, (dr, dc) => dr === -1 || dc === -1],
  [STAIRS_TRAVERSAL_STATE, () => true],
]);

const isTraversalDirCompatible = (state: number, dr: number, dc: number): boolean =>
  dirRules.get(state)?.(dr, dc) ?? false;

export { isTraversalDirCompatible };
